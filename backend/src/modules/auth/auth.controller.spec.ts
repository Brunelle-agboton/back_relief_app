import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { UnauthorizedException } from '@nestjs/common';
import { PractitionerProfileService } from '../practitioner_profile/practitioner_profile.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    // Reset mocks
    mockAuthService.validateUser.mockClear();
    mockAuthService.login.mockClear();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token when login is successful', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = { id: 1, email: 'test@example.com' };
      const loginResult = { access_token: 'some_token' };

      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(loginResult);

      const result = await controller.login(loginUserDto);

      expect(service.validateUser).toHaveBeenCalledWith(loginUserDto.email, loginUserDto.password);
      expect(service.login).toHaveBeenCalledWith(user);
      expect(result).toEqual(loginResult);
    });

    it('should throw an UnauthorizedException when login fails', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'wrong_password',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
      expect(service.validateUser).toHaveBeenCalledWith(loginUserDto.email, loginUserDto.password);
      expect(service.login).not.toHaveBeenCalled();
    });
  });
});
