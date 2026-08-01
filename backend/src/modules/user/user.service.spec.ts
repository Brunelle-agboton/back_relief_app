import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

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
      const dto: CreateUserDto = { email: 'a@a.com', password: 'pass', userName: 'test', role: 'user', age: 25, poids: 70, taille: 180, sexe: 'male', hourSit: 8, isExercise: true, numberTraining: 3, restReminder: true, drinkReminder: true };
      const user = new User();
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockRepository.create.mockReturnValue(user);
      mockRepository.save.mockResolvedValue(user);

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
      expect(repository.create).toHaveBeenCalledWith({ ...dto, password: 'hashed_password' });
      expect(repository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = new User();
      mockRepository.findOne.mockResolvedValue(user);
      const result = await service.findByEmail('a@a.com');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'a@a.com' } });
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
      await expect(service.findOne(1)).rejects.toThrow('User with id 1 not found');
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

    it('should throw if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(99, { userName: 'x' })).rejects.toThrow('User with id 99 not found');
    });
  });

  describe('updateUserSetting', () => {
    it('should update and save user settings', async () => {
      const user = new User();
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue(user);

      const result = await service.updateUserSetting(1, true, false);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(user.restReminder).toBe(true);
      expect(user.drinkReminder).toBe(false);
      expect(repository.save).toHaveBeenCalledWith(user);
      expect(result).toBe('ok');
    });

    it('should throw if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.updateUserSetting(1, true, false)).rejects.toThrow('User with id 1 not found');
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
      await expect(service.remove(99)).rejects.toThrow('User with id 99 not found');
    });
  });
});