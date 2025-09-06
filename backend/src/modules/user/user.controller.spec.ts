import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let authService: AuthService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    updateUserSetting: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const dto: CreateUserDto = { email: 'a@a.com', password: 'pass', userName: 'test', role: 'user', age: 25, poids: 70, taille: 180, sexe: 'male', hourSit: 8, isExercise: true, numberTraining: 3, restReminder: true, drinkReminder: true };
      const user = new User();
      mockUserService.create.mockResolvedValue(user);
      const result = await controller.register(dto);
      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(user);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const dto = { email: 'a@a.com', password: 'pass' };
      const user = new User();
      const token = { access_token: 'jwt' };
      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(token);
      const result = await controller.login(dto);
      expect(authService.validateUser).toHaveBeenCalledWith(dto.email, dto.password);
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(result).toBe(token);
    });

    it('should throw UnauthorizedException if login fails', async () => {
      const dto = { email: 'a@a.com', password: 'pass' };
      mockAuthService.validateUser.mockResolvedValue(null);
      await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findAll', () => {
    it('should return all users', () => {
      mockUserService.findAll.mockReturnValue([]);
      expect(controller.findAll()).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find a user by id', () => {
      const user = new User();
      mockUserService.findOne.mockResolvedValue(user);
      expect(controller.findById(1)).resolves.toBe(user);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', () => {
      const user = new User();
      mockUserService.findByEmail.mockResolvedValue(user);
      expect(controller.findByEmail('a@a.com')).resolves.toBe(user);
    });
  });

  describe('update', () => {
    it('should update a user', () => {
      const dto: UpdateUserDto = { userName: 'new' };
      mockUserService.update.mockResolvedValue({} as any);
      expect(controller.update('1', dto)).resolves.toEqual({});
    });
  });

  describe('updateUserSetting', () => {
    it('should update user settings', () => {
      const dto = { restReminder: true, drinkReminder: false };
      mockUserService.updateUserSetting.mockResolvedValue('ok');
      expect(controller.updateUserSetting('1', dto)).resolves.toBe('ok');
    });
  });

  describe('remove', () => {
    it('should remove a user', () => {
      mockUserService.remove.mockResolvedValue(undefined);
      expect(controller.remove('1')).resolves.toBeUndefined();
    });
  });
});
