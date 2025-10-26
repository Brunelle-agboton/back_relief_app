import { Test, TestingModule } from '@nestjs/testing';
import { PractitionerProfileService } from './practitioner_profile.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PractitionerProfile, EstablishmentType, ProfessionalType } from './entities/practitioner_profile.entity';
import { UserService } from '../user/user.service';
import { AvailabilityService } from '../availability/availability.service';
import { Repository } from 'typeorm';
import { CreatePractitionerProfileDto } from './dto/create-practitioner_profile.dto';
import { UpdatePractitionerProfileDto } from './dto/update-practitioner_profile.dto';
import { User } from '../user/entities/user.entity';
import { CompletePractitionerProfileDto } from './dto/complete-practitioner_profile.dto';
import { AddAvailabilityToPractitionerDto } from './dto/add-availability-to-practitioner.dto';
import { Availability } from '../availability/entities/availability.entity';

describe('PractitionerProfileService', () => {
  let service: PractitionerProfileService;
  let repository: Repository<PractitionerProfile>;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockAvailabilityService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PractitionerProfileService,
        {
          provide: getRepositoryToken(PractitionerProfile),
          useValue: mockRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AvailabilityService,
          useValue: mockAvailabilityService,
        },
      ],
    }).compile();

    service = module.get<PractitionerProfileService>(PractitionerProfileService);
    repository = module.get<Repository<PractitionerProfile>>(getRepositoryToken(PractitionerProfile));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a practitioner profile', async () => {
      const dto: CreatePractitionerProfileDto = {
        userId: 1,
        professionalType: ProfessionalType.KINESIOLOGUE,
        establishmentType: EstablishmentType.CANADIAN_HEALTH_FACILITY,
        availabilities: { '2025-12-25': ['09:00'] },
        proSpecialities: [],
        licenseNumber: 'P12345',
        phone: '123-456-7890',
        city: 'Montreal',
        postalCode: 'H1H1H1',
        country: 'Canada',
      };
      const user = new User();
      user.id = 1;
      mockUserService.findOne.mockResolvedValue(user);
      mockRepository.create.mockReturnValue(new PractitionerProfile());
      mockRepository.save.mockResolvedValue(new PractitionerProfile());

      await service.create(dto);

      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw a NotFoundException if the user does not exist', async () => {
      const dto: CreatePractitionerProfileDto = {
        userId: 1,
        professionalType: ProfessionalType.KINESIOLOGUE,
        establishmentType: EstablishmentType.CANADIAN_HEALTH_FACILITY,
        availabilities: { '2025-12-25': ['09:00'] },
        proSpecialities: [],
        licenseNumber: 'P12345',
        phone: '123-456-7890',
        city: 'Montreal',
        postalCode: 'H1H1H1',
        country: 'Canada',
      };
      mockUserService.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow('User with ID 1 not found');
    });

    it('should throw a BadRequestException if the establishmentType is invalid', async () => {
      const dto: CreatePractitionerProfileDto = {
        userId: 1,
        professionalType: ProfessionalType.KINESIOLOGUE,
        establishmentType: 'invalid' as any,
        availabilities: { '2025-12-25': ['09:00'] },
        proSpecialities: [],
        licenseNumber: 'P12345',
        phone: '123-456-7890',
        city: 'Montreal',
        postalCode: 'H1H1H1',
        country: 'Canada',
      };
      const user = new User();
      user.id = 1;
      mockUserService.findOne.mockResolvedValue(user);

      await expect(service.create(dto)).rejects.toThrow('Invalid establishmentType: invalid');
    });

    it('should throw a BadRequestException if the professionalType is invalid', async () => {
      const dto: CreatePractitionerProfileDto = {
        userId: 1,
        professionalType: 'invalid' as any,
        establishmentType: EstablishmentType.CANADIAN_HEALTH_FACILITY,
        availabilities: { '2025-12-25': ['09:00'] },
        proSpecialities: [],
        licenseNumber: 'P12345',
        phone: '123-456-7890',
        city: 'Montreal',
        postalCode: 'H1H1H1',
        country: 'Canada',
      };
      const user = new User();
      user.id = 1;
      mockUserService.findOne.mockResolvedValue(user);

      await expect(service.create(dto)).rejects.toThrow('Invalid professionalType: invalid');
    });

    it('should throw a BadRequestException if proSpecialities is an invalid JSON string', async () => {
      const dto: CreatePractitionerProfileDto = {
        userId: 1,
        professionalType: ProfessionalType.KINESIOLOGUE,
        establishmentType: EstablishmentType.CANADIAN_HEALTH_FACILITY,
        availabilities: { '2025-12-25': ['09:00'] },
        proSpecialities: 'invalid json' as any,
        licenseNumber: 'P12345',
        phone: '123-456-7890',
        city: 'Montreal',
        postalCode: 'H1H1H1',
        country: 'Canada',
      };
      const user = new User();
      user.id = 1;
      mockUserService.findOne.mockResolvedValue(user);

      await expect(service.create(dto)).rejects.toThrow('proSpecialities must be a valid JSON array string');
    });
  });

  describe('findAll', () => {
    it('should return an array of practitioner profiles', async () => {
      const profiles = [new PractitionerProfile()];
      mockRepository.find.mockResolvedValue(profiles);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(profiles);
    });
  });

  describe('findOne', () => {
    it('should return a practitioner profile', async () => {
      const profile = new PractitionerProfile();
      mockRepository.findOne.mockResolvedValue(profile);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['user', 'availabilities', 'appointments', 'appointments.patient', 'appointments.practitionerProfile'] });
      expect(result).toEqual(profile);
    });
  });

  describe('update', () => {
    it('should update a practitioner profile', async () => {
      const dto = new UpdatePractitionerProfileDto();
      const profile = new PractitionerProfile();
      mockRepository.findOne.mockResolvedValue(profile);
      mockRepository.save.mockResolvedValue(profile);

      const result = await service.update(1, dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith(profile);
      expect(result).toEqual(profile);
    });

    it('should throw a NotFoundException if the practitioner profile does not exist', async () => {
      const dto = new UpdatePractitionerProfileDto();
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, dto)).rejects.toThrow('PractitionerProfile with ID 1 not found');
    });
  });

  describe('remove', () => {
    it('should remove a practitioner profile', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: `PractitionerProfile with ID 1 has been successfully removed` });
    });

    it('should throw a NotFoundException if the practitioner profile to remove does not exist', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(1)).rejects.toThrow('PractitionerProfile with ID 1 not found');
    });
  });

  describe('completePractionerProfile', () => {
    it('should complete a practitioner profile', async () => {
      const dto: CompletePractitionerProfileDto = {
        availabilities: { '2025-12-25': ['09:00'] },
        proSpecialities: [],
        diplomes: [],
      };
      const profile = new PractitionerProfile();
      mockRepository.findOne.mockResolvedValue(profile);
      mockRepository.save.mockResolvedValue(profile);

      const result = await service.completePractionerProfile(1, dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith(profile);
      expect(result).toEqual(profile);
    });

    it('should throw a NotFoundException if the practitioner does not exist', async () => {
      const dto: CompletePractitionerProfileDto = {
        availabilities: { '2025-12-25': ['09:00'] },
        proSpecialities: [],
        diplomes: [],
      };
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.completePractionerProfile(1, dto)).rejects.toThrow('Practioner with ID 1 not found');
    });

    it('should throw a BadRequestException if proSpecialities is an invalid JSON string', async () => {
      const dto: CompletePractitionerProfileDto = {
        availabilities: { '2025-12-25': ['09:00'] },
        proSpecialities: 'invalid json' as any,
        diplomes: [],
      };
      const profile = new PractitionerProfile();
      mockRepository.findOne.mockResolvedValue(profile);

      await expect(service.completePractionerProfile(1, dto)).rejects.toThrow('proSpecialities must be a valid JSON array string');
    });

    it('should handle proSpecialities as a string', async () => {
      const dto: CompletePractitionerProfileDto = {
        availabilities: { '2025-12-25': ['09:00'] },
        proSpecialities: ["test"],
        diplomes: [],
      };
      const profile = new PractitionerProfile();
      mockRepository.findOne.mockResolvedValue(profile);
      mockRepository.save.mockResolvedValue(profile);

      const result = await service.completePractionerProfile(1, dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith(profile);
      expect(profile.specialties).toEqual(['test']);
      expect(result).toEqual(profile);
    });

    it('should handle diplomes as a string', async () => {
      const dto: CompletePractitionerProfileDto = {
        availabilities: { '2025-12-25': ['09:00'] },
        proSpecialities: [],
        diplomes: '[{"diplome":"test","school":"test","country":"test","year":2020}]' as any,
      };
      const profile = new PractitionerProfile();
      mockRepository.findOne.mockResolvedValue(profile);
      mockRepository.save.mockResolvedValue(profile);

      const result = await service.completePractionerProfile(1, dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith(profile);
      expect(profile.diplomes[0].diplome).toEqual('test');
      expect(result).toEqual(profile);
    });

    it('should throw a BadRequestException if diplomes is an invalid JSON string', async () => {
      const dto: CompletePractitionerProfileDto = {
        availabilities: { '2025-12-25': ['09:00'] },
        proSpecialities: [],
        diplomes: 'invalid json' as any,
      };
      const profile = new PractitionerProfile();
      mockRepository.findOne.mockResolvedValue(profile);

      await expect(service.completePractionerProfile(1, dto)).rejects.toThrow('diplomes must be a valid JSON array string');
    });
  });

  describe('findForUser', () => {
    it('should return a practitioner profile for a user', async () => {
      const profile = new PractitionerProfile();
      mockRepository.findOne.mockResolvedValue(profile);

      const result = await service.findForUser(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { user: { id: 1 } }, relations: ['user', 'availabilities', 'appointments', 'appointments.patient', 'appointments.practitionerProfile'] });
      expect(result).toEqual(profile);
    });

    it('should throw a NotFoundException if the practitioner profile for the user does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findForUser(1)).rejects.toThrow('Practitioner profile for user with ID 1 not found');
    });
  });

  describe('findByEmail', () => {
    it('should return a practitioner profile for an email', async () => {
      const profile = new PractitionerProfile();
      mockRepository.createQueryBuilder().getOne.mockResolvedValue(profile);

      const result = await service.findByEmail('test@test.com');

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(profile);
    });

    it('should throw a NotFoundException if the practitioner profile for the email does not exist', async () => {
      mockRepository.createQueryBuilder().getOne.mockResolvedValue(null);

      await expect(service.findByEmail('test@test.com')).rejects.toThrow('Practitioner profile for user with email test@test.com not found');
    });
  });

  describe('addAvailability', () => {
    it('should add an availability to a practitioner profile', async () => {
      const dto: AddAvailabilityToPractitionerDto = {
        userId: 1,
        startTime: new Date('2026-12-25T10:00:00.000Z').toISOString(),
        endTime: new Date('2026-12-25T10:30:00.000Z').toISOString(),
        timezone: 'Canada/Québec',
        note: '',
      };
      const profile = new PractitionerProfile();
      profile.availabilities = [];
      mockRepository.findOne.mockResolvedValue(profile);
      mockAvailabilityService.create.mockResolvedValue(new Availability());

      const result = await service.addAvailability(dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['availabilities'] });
      expect(mockAvailabilityService.create).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Availability);
    });

    it('should throw a NotFoundException if the practitioner profile does not exist', async () => {
      const dto: AddAvailabilityToPractitionerDto = {
        userId: 1,
        startTime: new Date('2026-12-25T10:00:00.000Z').toISOString(),
        endTime: new Date('2026-12-25T10:30:00.000Z').toISOString(),
        timezone: 'Canada/Québec',
        note: '',
      };
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.addAvailability(dto)).rejects.toThrow('Practitioner profile for user with ID 1 not found');
    });

    it('should throw a BadRequestException if start time is not before end time', async () => {
      const dto: AddAvailabilityToPractitionerDto = {
        userId: 1,
        startTime: new Date('2026-12-25T10:30:00.000Z').toISOString(),
        endTime: new Date('2026-12-25T10:00:00.000Z').toISOString(),
        timezone: 'Canada/Québec',
        note: '',
      };
      const profile = new PractitionerProfile();
      profile.availabilities = [];
      mockRepository.findOne.mockResolvedValue(profile);

      await expect(service.addAvailability(dto)).rejects.toThrow('Start time must be before end time.');
    });

    it('should throw a BadRequestException if availability is in the past', async () => {
      const dto: AddAvailabilityToPractitionerDto = {
        userId: 1,
        startTime: new Date('2020-12-25T10:00:00.000Z').toISOString(),
        endTime: new Date('2020-12-25T10:30:00.000Z').toISOString(),
        timezone: 'Canada/Québec',
        note: '',
      };
      const profile = new PractitionerProfile();
      profile.availabilities = [];
      mockRepository.findOne.mockResolvedValue(profile);

      await expect(service.addAvailability(dto)).rejects.toThrow('Cannot add availability in the past.');
    });

    it('should throw a BadRequestException if availability slot already exists', async () => {
      const dto: AddAvailabilityToPractitionerDto = {
        userId: 1,
        startTime: new Date('2026-12-25T10:00:00.000Z').toISOString(),
        endTime: new Date('2026-12-25T10:30:00.000Z').toISOString(),
        timezone: 'Canada/Québec',
        note: '',
      };
      const profile = new PractitionerProfile();
      const existingAvailability = new Availability();
      existingAvailability.startTime = new Date('2026-12-25T10:00:00.000Z');
      existingAvailability.endTime = new Date('2026-12-25T10:30:00.000Z');
      profile.availabilities = [existingAvailability];
      mockRepository.findOne.mockResolvedValue(profile);

      await expect(service.addAvailability(dto)).rejects.toThrow('This availability slot already exists.');
    });
  });
});