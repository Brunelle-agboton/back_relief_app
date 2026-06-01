import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { PractitionerProfileService } from '../practitioner_profile/practitioner_profile.service';
import { AppointmentService } from '../appointment/appointment.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockPractitionerProfileService = {
    findForUser: jest.fn(),
    create: jest.fn(),
  };

  const mockAppointmentService = {
    findAppointmentsForUser: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
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

      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const { password, ...result } = user;
      const resultValidate = await service.validateUser('test@example.com', 'password');

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed_password');
      expect(resultValidate).toEqual(result);
    });

    it('should return null if user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const user = new User();
      user.email = 'test@example.com';
      user.password = 'hashed_password';

      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong_password');

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong_password', 'hashed_password');
      expect(result).toBeNull();
    });
  });

  describe('registerPractitioner', () => {
    it('crée un utilisateur, un profil et un rendez-vous d\'onboarding', async () => {
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

      const createdUser = { id: 5, email: dto.email, role: 'practitioner' } as any;
      const createdProfile = { id: 10 } as any;
      const createdAppointment = { id: 20 } as any;

      mockUserService.create.mockResolvedValue(createdUser);
      mockPractitionerProfileService.create.mockResolvedValue(createdProfile);
      mockAppointmentService.create.mockResolvedValue(createdAppointment);

      const result = await service.registerPractitioner(dto);

      expect(mockUserService.create).toHaveBeenCalledWith({
        email: dto.email,
        password: dto.password,
        userName: dto.userName,
        role: 'practitioner',
      });
      expect(mockPractitionerProfileService.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: createdUser.id }),
      );
      expect(mockAppointmentService.create).toHaveBeenCalledWith(
        expect.objectContaining({ patientId: createdUser.id, practitionerId: 1 }),
      );
      expect(result).toEqual({ user: createdUser, profile: createdProfile, appointment: createdAppointment });
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = { email: 'test@example.com', id: 1, role: 'user' } as unknown as Omit<User, 'password'>;
      const token = 'some_token';
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({ email: 'test@example.com', sub: 1, role: 'user' });
      expect(result).toEqual({ access_token: token });
    });
  });
});