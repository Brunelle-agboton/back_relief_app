import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;
  let authService: Partial<Record<keyof AuthService, jest.Mock>>;

  beforeEach(async () => {
    userService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    authService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a user', async () => {
    const dto = { email: 'a@a.com', password: 'pass', userName: 'test' };
    const user = { id: 1, ...dto };
    (userService.create as jest.Mock).mockResolvedValue(user);

    const result = await controller.register(dto as any);
    expect(userService.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(user);
  });

  it('should login a user', async () => {
    const dto = { email: 'a@a.com', password: 'pass' };
    const user = { id: 1, email: dto.email };
    const token = { access_token: 'jwt' };
    (authService.validateUser as jest.Mock).mockResolvedValue(user);
    (authService.login as jest.Mock).mockResolvedValue(token);

    const result = await controller.login(dto as any);
    expect(authService.validateUser).toHaveBeenCalledWith(dto.email, dto.password);
    expect(authService.login).toHaveBeenCalledWith(user);
    expect(result).toBe(token);
  });

  it('should throw UnauthorizedException if login fails', async () => {
    const dto = { email: 'a@a.com', password: 'pass' };
    (authService.validateUser as jest.Mock).mockResolvedValue(null);

    await expect(controller.login(dto as any)).rejects.toThrow(UnauthorizedException);
  });

  it('should return all users', () => {
    (userService.findAll as jest.Mock).mockReturnValue(['user1', 'user2']);
    expect(controller.findAll()).toEqual(['user1', 'user2']);
  });

  it('should find user by email', () => {
    (userService.findByEmail as jest.Mock).mockReturnValue('user');
    expect(controller.findByEmail('a@a.com')).toBe('user');
  });

  it('should update a user', () => {
    (userService.update as jest.Mock).mockReturnValue('updated');
    expect(controller.update('1', { userName: 'new' } as any)).toBe('updated');
  });

  it('should remove a user', () => {
    (userService.remove as jest.Mock).mockReturnValue('removed');
    expect(controller.remove('1')).toBe('removed');
  });
});