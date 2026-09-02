import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { PractitionerProfileService } from '../practitioner_profile/practitioner_profile.service';
import { AppointmentService } from '../appointment/appointment.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { TokenType } from './jwt.constants';
import {
  UUID_A,
  UUID_B,
  UUID_C,
  UUID_D,
  UUID_E,
  UUID_MISSING,
} from '../../common/testing/uuid.fixtures';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    findAuthContext: jest.fn(),
    revokeTokens: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockPractitionerProfileService = {
    findForUser: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockAppointmentService = {
    findAppointmentsForUser: jest.fn(),
    create: jest.fn(),
  };

  beforeAll(() => {
    process.env.MODE = 'DEV';
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PractitionerProfileService,
          useValue: mockPractitionerProfileService,
        },
        {
          provide: AppointmentService,
          useValue: mockAppointmentService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data if validation is successful', async () => {
      const user = new User();
      user.email = 'test@example.com';
      user.password = 'hashed_password';

      mockUserService.findByEmailWithPassword.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const { password, ...result } = user;
      const resultValidate = await service.validateUser(
        'test@example.com',
        'password',
      );

      expect(userService.findByEmailWithPassword).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        'hashed_password',
      );
      expect(resultValidate).toEqual(result);
    });

    it('should return null if user is not found', async () => {
      mockUserService.findByEmailWithPassword.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(userService.findByEmailWithPassword).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const user = new User();
      user.email = 'test@example.com';
      user.password = 'hashed_password';

      mockUserService.findByEmailWithPassword.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrong_password',
      );

      expect(userService.findByEmailWithPassword).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong_password',
        'hashed_password',
      );
      expect(result).toBeNull();
    });
  });

  describe('registerPractitioner', () => {
    it("crée un utilisateur, un profil et un rendez-vous d'onboarding", async () => {
      const dto = {
        email: 'pro@test.com',
        password: 'secret123',
        userName: 'DrTest',
        professionalType: 'kinesiologue' as any,
        licenseNumber: 'LIC-001',
        proSpecialities: ['dos'],
        establishmentType: 'canadian_health_facility' as any,
        phone: '514-000-0000',
        city: 'Montréal',
        postalCode: 'H1H 1H1',
        country: 'Canada',
        availabilities: {},
        appointment: { startTime: '2027-01-10T09:00:00.000Z' },
      };

      const createdUser = {
        id: UUID_E,
        email: dto.email,
        role: 'practitioner',
      } as any;
      const createdProfile = { id: UUID_C } as any;
      const createdAppointment = { id: UUID_D } as any;

      // Le praticien d'accueil est désormais résolu par son adresse e-mail :
      // l'identifiant `1` codé en dur n'a plus de sens avec des clés UUID.
      process.env.ONBOARDING_PRACTITIONER_EMAIL = 'accueil@test.com';
      mockPractitionerProfileService.findByEmail.mockResolvedValue({
        id: UUID_B,
      });
      mockUserService.create.mockResolvedValue(createdUser);
      mockPractitionerProfileService.create.mockResolvedValue(createdProfile);
      mockAppointmentService.create.mockResolvedValue(createdAppointment);

      const result = await service.registerPractitioner(dto);

      // SEC-03 : le rôle est imposé par la route, il ne transite plus par le DTO.
      expect(mockUserService.create).toHaveBeenCalledWith(
        { email: dto.email, password: dto.password, userName: dto.userName },
        UserRole.PRACTITIONER,
      );
      expect(mockPractitionerProfileService.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: createdUser.id }),
      );
      expect(mockPractitionerProfileService.findByEmail).toHaveBeenCalledWith(
        'accueil@test.com',
      );
      expect(mockAppointmentService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: createdUser.id,
          practitionerId: UUID_B,
        }),
      );
      expect(result).toEqual({
        user: createdUser,
        profile: createdProfile,
        appointment: createdAppointment,
      });
    });

    it("refuse l'inscription si aucun praticien d'accueil n'est configuré", async () => {
      delete process.env.ONBOARDING_PRACTITIONER_EMAIL;
      delete process.env.PUBLIC_PRACTITIONER_EMAILS;
      mockUserService.create.mockResolvedValue({ id: UUID_E } as any);

      await expect(
        service.registerPractitioner({
          email: 'pro@test.com',
          password: 'secret123',
          userName: 'DrTest',
          professionalType: 'kinesiologue' as any,
          establishmentType: 'canadian_health_facility' as any,
          postalCode: 'H1H 1H1',
          appointment: { startTime: '2027-01-10T09:00:00.000Z' },
        }),
      ).rejects.toThrow("Aucun praticien d'accueil configuré");
    });
  });

  describe('login', () => {
    it('émet un couple access + refresh porteur du rôle et de la version', async () => {
      const user = {
        email: 'test@example.com',
        id: UUID_A,
        role: UserRole.USER,
        tokenVersion: 3,
      } as unknown as Omit<User, 'password'>;
      mockJwtService.sign
        .mockReturnValueOnce('access')
        .mockReturnValueOnce('refresh');

      const result = await service.login(user);

      // SEC-08 : le rôle et la version de révocation sont dans le payload.
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        1,
        {
          email: 'test@example.com',
          sub: UUID_A,
          role: UserRole.USER,
          tv: 3,
          typ: TokenType.ACCESS,
        },
        expect.objectContaining({ secret: 'test-secret' }),
      );
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ typ: TokenType.REFRESH }),
        expect.any(Object),
      );
      expect(result).toEqual(
        expect.objectContaining({
          access_token: 'access',
          refresh_token: 'refresh',
        }),
      );
    });
  });

  describe('refresh', () => {
    // SEC-08
    it("rejette un jeton qui n'est pas un refresh token", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: UUID_A,
        typ: TokenType.ACCESS,
        tv: 0,
      });
      await expect(service.refresh('token')).rejects.toThrow(
        'Type de jeton invalide',
      );
    });

    it('rejette un refresh token dont la version a été révoquée', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: UUID_A,
        typ: TokenType.REFRESH,
        tv: 1,
      });
      mockUserService.findAuthContext.mockResolvedValue({
        id: UUID_A,
        email: 'a@a.com',
        role: UserRole.USER,
        tokenVersion: 2,
      });
      await expect(service.refresh('token')).rejects.toThrow(
        'Refresh token révoqué',
      );
    });

    it('émet un nouveau couple de jetons pour un refresh valide', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: UUID_A,
        typ: TokenType.REFRESH,
        tv: 2,
      });
      mockUserService.findAuthContext.mockResolvedValue({
        id: UUID_A,
        email: 'a@a.com',
        role: UserRole.USER,
        tokenVersion: 2,
      });
      mockJwtService.sign
        .mockReturnValueOnce('access2')
        .mockReturnValueOnce('refresh2');

      const result = await service.refresh('token');

      expect(result.access_token).toBe('access2');
      expect(result.refresh_token).toBe('refresh2');
    });
  });

  describe('logout', () => {
    // SEC-08 : la déconnexion révoque réellement les jetons côté serveur.
    it("incrémente la version de jeton de l'utilisateur", async () => {
      mockUserService.revokeTokens.mockResolvedValue(undefined);
      await service.logout(UUID_B);
      expect(mockUserService.revokeTokens).toHaveBeenCalledWith(UUID_B);
    });
  });
});
