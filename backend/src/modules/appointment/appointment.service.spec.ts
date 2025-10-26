import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentService } from './appointment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UserService } from '../user/user.service';
import { PractitionerProfileService } from '../practitioner_profile/practitioner_profile.service';
import { AvailabilityService } from '../availability/availability.service';
import { User } from '../user/entities/user.entity';
import { PractitionerProfile } from '../practitioner_profile/entities/practitioner_profile.entity';
import { Availability } from '../availability/entities/availability.entity';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let repository: Repository<Appointment>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockPractitionerProfileService = {
    findOne: jest.fn(),
  };

  const mockAvailabilityService = {
    book: jest.fn(),
    findExactSlot: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: PractitionerProfileService,
          useValue: mockPractitionerProfileService,
        },
        {
          provide: AvailabilityService,
          useValue: mockAvailabilityService,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    repository = module.get<Repository<Appointment>>(getRepositoryToken(Appointment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save an appointment', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        patientId: 1,
        practitionerId: 1,
        startTime: new Date('2026-12-25T10:00:00.000Z').toISOString(),
        // end_at: new Date(),
        // notes: 'test note',
      };
      const appointment = new Appointment();
      const patient = new User();
      const practitioner = new PractitionerProfile();
      const availability = new Availability();
      mockUserService.findOne.mockResolvedValue(patient);
      mockPractitionerProfileService.findOne.mockResolvedValue(practitioner);
      mockAvailabilityService.findExactSlot.mockResolvedValue(availability);
      mockRepository.create.mockReturnValue(appointment);
      mockRepository.save.mockResolvedValue(appointment);

      const result = await service.create(createAppointmentDto);

      expect(repository.create).toHaveBeenCalledWith({
        start_at: new Date(createAppointmentDto.startTime),
        end_at: new Date(new Date(createAppointmentDto.startTime).getTime() + 30 * 60000),
        status: 'confirmed',
        patient: patient,
        practitionerProfile: practitioner,
        note: createAppointmentDto.note,
      });
      expect(repository.save).toHaveBeenCalledWith(appointment);
      expect(result).toEqual(appointment);
    });

    it('should throw NotFoundException if patient not found', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        patientId: 1,
        practitionerId: 1,
        startTime: new Date('2026-12-25T10:00:00.000Z').toISOString(),
      };
      mockUserService.findOne.mockResolvedValue(null);

      await expect(service.create(createAppointmentDto)).rejects.toThrow(
        `Patient with ID ${createAppointmentDto.patientId} not found.`,
      );
    });

    it('should throw NotFoundException if practitioner not found', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        patientId: 1,
        practitionerId: 1,
        startTime: new Date('2026-12-25T10:00:00.000Z').toISOString(),
      };
      const patient = new User();
      mockUserService.findOne.mockResolvedValue(patient);
      mockPractitionerProfileService.findOne.mockResolvedValue(null);

      await expect(service.create(createAppointmentDto)).rejects.toThrow(
        `Practitioner with ID ${createAppointmentDto.practitionerId} not found.`,
      );
    });

    it('should throw BadRequestException for invalid startTime format', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        patientId: 1,
        practitionerId: 1,
        startTime: 'invalid-date',
      };
      const patient = new User();
      const practitioner = new PractitionerProfile();
      mockUserService.findOne.mockResolvedValue(patient);
      mockPractitionerProfileService.findOne.mockResolvedValue(practitioner);

      await expect(service.create(createAppointmentDto)).rejects.toThrow(
        'Invalid startTime format. Please provide a valid ISO 8601 date string.',
      );
    });

    it('should throw BadRequestException if appointment is in the past', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        patientId: 1,
        practitionerId: 1,
        startTime: new Date('2020-01-01T10:00:00.000Z').toISOString(),
      };
      const patient = new User();
      const practitioner = new PractitionerProfile();
      mockUserService.findOne.mockResolvedValue(patient);
      mockPractitionerProfileService.findOne.mockResolvedValue(practitioner);

      await expect(service.create(createAppointmentDto)).rejects.toThrow(
        'Cannot book an appointment in the past.',
      );
    });

    it('should throw BadRequestException if no matching availability slot found', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        patientId: 1,
        practitionerId: 1,
        startTime: new Date('2026-12-25T10:00:00.000Z').toISOString(),
      };
      const patient = new User();
      const practitioner = new PractitionerProfile();
      mockUserService.findOne.mockResolvedValue(patient);
      mockPractitionerProfileService.findOne.mockResolvedValue(practitioner);
      mockAvailabilityService.findExactSlot.mockResolvedValue(null);

      await expect(service.create(createAppointmentDto)).rejects.toThrow(
        'No matching availability slot found for this time.',
      );
    });

    it('should throw BadRequestException if slot is already booked', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        patientId: 1,
        practitionerId: 1,
        startTime: new Date('2026-12-25T10:00:00.000Z').toISOString(),
      };
      const patient = new User();
      const practitioner = new PractitionerProfile();
      const availability = new Availability();
      availability.isBooked = true;
      mockUserService.findOne.mockResolvedValue(patient);
      mockPractitionerProfileService.findOne.mockResolvedValue(practitioner);
      mockAvailabilityService.findExactSlot.mockResolvedValue(availability);

      await expect(service.create(createAppointmentDto)).rejects.toThrow(
        'This slot is already booked.',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of appointments', async () => {
      const appointments = [new Appointment()];
      mockRepository.find.mockResolvedValue(appointments);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(appointments);
    });
  });

  describe('findByPractitionerId', () => {
    it('should return appointments for a given practitioner ID', async () => {
      const practitionerId = 1;
      const appointments = [new Appointment()];
      mockRepository.find.mockResolvedValue(appointments);

      const result = await service.findByPractitionerId(practitionerId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          practitionerProfile: { id: practitionerId },
        },
        relations: ['patient', 'practitionerPofile'],
        order: {
          start_at: 'ASC',
        },
      });
      expect(result).toEqual(appointments);
    });
  });

  describe('findByUserId', () => {
    it('should return appointments for a given user ID', async () => {
      const userId = 1;
      const appointments = [new Appointment()];
      mockRepository.find.mockResolvedValue(appointments);

      const result = await service.findByUserId(userId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          patient: { id: userId },
          status: 'confirmed',
        },
        relations: ['patient', 'practitionerProfile', 'practitionerProfile.user'],
        order: {
          start_at: 'ASC',
        },
      });
      expect(result).toEqual(appointments);
    });
  });
});