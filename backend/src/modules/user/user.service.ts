import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserRole } from '../../common/enums/user-role.enum';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * SEC-03 : le rôle n'est jamais lu depuis le DTO. Il est passé explicitement
   * par l'appelant côté serveur et vaut UserRole.USER par défaut.
   */
  async create(
    dto: CreateUserDto,
    role: UserRole = UserRole.USER,
  ): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(
        'Un compte existe déjà pour cette adresse e-mail',
      );
    }

    const hash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = this.usersRepository.create({
      ...dto,
      password: hash,
      role,
    });
    await this.usersRepository.save(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Seule voie d'accès au hash (colonne `select: false`), réservée à
   * l'authentification et à la vérification du mot de passe courant.
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  /**
   * SEC-08 : contexte minimal rechargé à chaque requête authentifiée. Permet de
   * propager un rôle à jour et de rejeter les jetons révoqués ou appartenant à
   * un compte supprimé.
   */
  async findAuthContext(
    id: string,
  ): Promise<Pick<User, 'id' | 'email' | 'role' | 'tokenVersion'> | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: { id: true, email: true, role: true, tokenVersion: true },
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    /**
     * SEC-09 : `password` n'est plus exposé par UpdateUserDto, mais on hache
     * malgré tout toute valeur qui parviendrait jusqu'ici — un mot de passe
     * stocké en clair rendait le compte inutilisable (bcrypt.compare échouant).
     */
    const { password, ...safeFields } = updateUserDto as UpdateUserDto & {
      password?: string;
    };
    Object.assign(user, safeFields);
    if (password) {
      user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    return this.usersRepository.save(user);
  }

  /** SEC-09 : changement de mot de passe avec re-vérification et révocation des jetons. */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'Le nouveau mot de passe doit être différent',
      );
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    // Un changement de mot de passe invalide les sessions ouvertes ailleurs.
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await this.usersRepository.save(user);
  }

  async updateUserSetting(
    id: string,
    settings: UpdateUserSettingsDto,
  ): Promise<string> {
    const user = await this.findOne(id);

    if (settings.restReminder !== undefined) {
      user.restReminder = settings.restReminder;
    }
    if (settings.drinkReminder !== undefined) {
      user.drinkReminder = settings.drinkReminder;
    }
    await this.usersRepository.save(user);
    return 'ok';
  }

  /** SEC-08 : révocation immédiate de tous les jetons émis pour cet utilisateur. */
  async revokeTokens(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
