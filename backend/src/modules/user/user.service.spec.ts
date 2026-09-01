import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/user-role.enum';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockQueryBuilder = {
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.addSelect.mockReturnThis();
    mockQueryBuilder.where.mockReturnThis();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const dto: CreateUserDto = {
        email: 'a@a.com',
        password: 'pass',
        userName: 'test',
        age: 25,
        poids: 70,
        taille: 180,
        sexe: 'male',
        hourSit: 8,
        isExercise: true,
        numberTraining: 3,
        restReminder: true,
        drinkReminder: true,
      };
      const user = new User();
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(user);
      mockRepository.save.mockResolvedValue(user);

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashed_password',
        role: UserRole.USER,
      });
      expect(repository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });

    // SEC-03 : le rôle vient de l'appelant côté serveur, jamais du DTO.
    it('applique le rôle passé explicitement par le serveur', async () => {
      const dto: CreateUserDto = {
        email: 'p@p.com',
        password: 'pass',
        userName: 'pro',
      };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(new User());
      mockRepository.save.mockResolvedValue(new User());

      await service.create(dto, UserRole.PRACTITIONER);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.PRACTITIONER }),
      );
    });

    it('refuse une adresse e-mail déjà utilisée', async () => {
      mockRepository.findOne.mockResolvedValue(new User());
      await expect(
        service.create({
          email: 'a@a.com',
          password: 'pass',
          userName: 'test',
        }),
      ).rejects.toThrow('Un compte existe déjà pour cette adresse e-mail');
    });
  });

  describe('findByEmailWithPassword', () => {
    // SEC-01 : le hash n'est accessible que par une requête explicite.
    it('ajoute explicitement la colonne password', async () => {
      const user = new User();
      mockQueryBuilder.getOne.mockResolvedValue(user);

      const result = await service.findByEmailWithPassword('a@a.com');

      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.password');
      expect(result).toBe(user);
    });
  });

  describe('changePassword', () => {
    // SEC-09
    it('hache le nouveau mot de passe et révoque les jetons', async () => {
      const user = new User();
      user.password = 'old_hash';
      user.tokenVersion = 2;
      mockQueryBuilder.getOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hash');
      mockRepository.save.mockResolvedValue(user);

      await service.changePassword(1, 'old', 'brandnew');

      expect(bcrypt.hash).toHaveBeenCalledWith('brandnew', 10);
      expect(user.password).toBe('new_hash');
      expect(user.tokenVersion).toBe(3);
    });

    it('refuse un mot de passe actuel incorrect', async () => {
      const user = new User();
      user.password = 'old_hash';
      mockQueryBuilder.getOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(1, 'wrong', 'brandnew'),
      ).rejects.toThrow('Mot de passe actuel incorrect');
    });
  });

  describe('revokeTokens', () => {
    // SEC-08
    it('incrémente tokenVersion', async () => {
      const user = new User();
      user.tokenVersion = 0;
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue(user);

      await service.revokeTokens(1);

      expect(user.tokenVersion).toBe(1);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = new User();
      mockRepository.findOne.mockResolvedValue(user);
      const result = await service.findByEmail('a@a.com');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'a@a.com' },
      });
      expect(result).toEqual(user);
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      const user = new User();
      mockRepository.findOne.mockResolvedValue(user);
      const result = await service.findOne(1);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(user);
    });

    it('should throw an error if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(
        'User with id 1 not found',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [new User(), new User()];
      mockRepository.find.mockResolvedValue(users);
      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('update', () => {
    it('should find user, apply changes and save', async () => {
      const user = new User();
      user.id = 1;
      user.userName = 'old';
      const dto: UpdateUserDto = { userName: 'new' };
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue({ ...user, ...dto });

      const result = await service.update(1, dto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalled();
      expect(result.userName).toBe('new');
    });

    // SEC-09 : un mot de passe qui parviendrait jusqu'ici est haché, jamais
    // écrit en clair comme c'était le cas auparavant.
    it('hache un mot de passe qui atteindrait update()', async () => {
      const user = new User();
      user.id = 1;
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockImplementation(async (u) => u);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      await service.update(1, { password: 'plaintext' } as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext', 10);
      expect(user.password).toBe('hashed_password');
    });

    it('should throw if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(99, { userName: 'x' })).rejects.toThrow(
        'User with id 99 not found',
      );
    });
  });

  describe('updateUserSetting', () => {
    it('should update and save user settings', async () => {
      const user = new User();
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue(user);

      const result = await service.updateUserSetting(1, {
        restReminder: true,
        drinkReminder: false,
      });

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(user.restReminder).toBe(true);
      expect(user.drinkReminder).toBe(false);
      expect(repository.save).toHaveBeenCalledWith(user);
      expect(result).toBe('ok');
    });

    it('should throw if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(
        service.updateUserSetting(1, {
          restReminder: true,
          drinkReminder: false,
        }),
      ).rejects.toThrow('User with id 1 not found');
    });
  });

  describe('remove', () => {
    it('should find and remove the user', async () => {
      const user = new User();
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(user);
    });

    it('should throw if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(
        'User with id 99 not found',
      );
    });
  });
});
