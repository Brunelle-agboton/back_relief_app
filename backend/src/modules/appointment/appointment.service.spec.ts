import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentService } from './appointment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let repository: Repository<Appointment>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockRepository,
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
        start_at: new Date(),
        end_at: new Date(),
        notes: 'test note',
      };
      const appointment = new Appointment();
      mockRepository.create.mockReturnValue(appointment);
      mockRepository.save.mockResolvedValue(appointment);

      const result = await service.create(createAppointmentDto);

      expect(repository.create).toHaveBeenCalledWith(createAppointmentDto);
      expect(repository.save).toHaveBeenCalledWith(appointment);
      expect(result).toEqual(appointment);
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
});
