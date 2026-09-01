import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { PractitionerProfileService } from '../practitioner_profile/practitioner_profile.service';
import { AppointmentService } from '../appointment/appointment.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreatePractitionerProfileDto } from '../practitioner_profile/dto/create-practitioner_profile.dto';
import { CreateAppointmentDto } from '../appointment/dto/create-appointment.dto';
import { RegisterPractitionerDto } from './dto/register-practitioner.dto';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import {
  getAccessTokenTtl,
  getJwtRefreshSecret,
  getJwtSecret,
  getRefreshTokenTtl,
  JwtPayload,
  TokenType,
} from './jwt.constants';

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: string;
}

/** Identifiant du praticien « d'accueil » avec lequel un nouveau pro prend rendez-vous. */
const ONBOARDING_PRACTITIONER_PROFILE_ID = 1;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private practitionerProfileService: PractitionerProfileService,
    private appointmentService: AppointmentService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    // Le hash est en `select: false` : il faut le demander explicitement.
    const user = await this.usersService.findByEmailWithPassword(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /** SEC-08 : émission d'un couple access + refresh, tous deux versionnés. */
  async login(user: Omit<User, 'password'>): Promise<TokenPair> {
    return this.issueTokens(
      user.id,
      user.email,
      user.role,
      user.tokenVersion ?? 0,
    );
  }

  /**
   * SEC-08 : renouvellement sans ressaisie des identifiants. Le refresh token
   * est vérifié avec son propre secret, doit porter `typ: refresh`, et sa
   * version doit encore correspondre à celle de l'utilisateur.
   */
  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: getJwtRefreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    if (payload.typ !== TokenType.REFRESH) {
      throw new UnauthorizedException('Type de jeton invalide');
    }

    const user = await this.usersService.findAuthContext(payload.sub);
    if (!user || (payload.tv ?? 0) !== (user.tokenVersion ?? 0)) {
      throw new UnauthorizedException('Refresh token révoqué');
    }

    return this.issueTokens(user.id, user.email, user.role, user.tokenVersion);
  }

  /**
   * SEC-08 : la déconnexion invalide côté serveur tous les jetons déjà émis
   * (un jeton volé cesse d'être exploitable sans attendre son expiration).
   */
  async logout(userId: number): Promise<{ message: string }> {
    await this.usersService.revokeTokens(userId);
    return { message: 'Session révoquée' };
  }

  private issueTokens(
    userId: number,
    email: string,
    role: UserRole,
    tokenVersion: number,
  ): TokenPair {
    const basePayload = { sub: userId, email, role, tv: tokenVersion };

    return {
      access_token: this.jwtService.sign(
        { ...basePayload, typ: TokenType.ACCESS },
        { secret: getJwtSecret(), expiresIn: getAccessTokenTtl() },
      ),
      refresh_token: this.jwtService.sign(
        { ...basePayload, typ: TokenType.REFRESH },
        { secret: getJwtRefreshSecret(), expiresIn: getRefreshTokenTtl() },
      ),
      expires_in: getAccessTokenTtl(),
    };
  }

  async registerPractitioner(
    dto: RegisterPractitionerDto,
  ): Promise<{ user: User; profile: unknown; appointment: unknown }> {
    const { email, password, userName, appointment, ...profileData } = dto;

    // SEC-03 : le rôle est imposé par la route, jamais lu depuis le corps.
    const createUserDto: CreateUserDto = { email, password, userName };
    const user = await this.usersService.create(
      createUserDto,
      UserRole.PRACTITIONER,
    );

    const createProfileDto: CreatePractitionerProfileDto = {
      userId: user.id,
      ...profileData,
    };
    const profile =
      await this.practitionerProfileService.create(createProfileDto);

    // Rendez-vous d'accueil : le nouveau praticien est ici le « patient ».
    const createAppointmentDto: CreateAppointmentDto = {
      patientId: user.id,
      practitionerId: ONBOARDING_PRACTITIONER_PROFILE_ID,
      startTime: appointment.startTime,
    };
    const newAppointment =
      await this.appointmentService.create(createAppointmentDto);

    return { user, profile, appointment: newAppointment };
  }
}
