import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointment.entity';

describe('AppointmentController', () => {
  let controller: AppointmentController;
  let service: AppointmentService;

  const mockAppointmentService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUserId: jest.fn(),
    findByPractitionerId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        {
          provide: AppointmentService,
          useValue: mockAppointmentService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
    service = module.get<AppointmentService>(AppointmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an appointment', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        patientId: 1,
        practitionerId: 1,
        startTime: new Date().toISOString(),
        // end_at: new Date().toISOString(),
        // notes: 'test note'
      };
      const expectedAppointment = new Appointment();
      mockAppointmentService.create.mockResolvedValue(expectedAppointment);

      const result = await controller.create(createAppointmentDto);

      expect(service.create).toHaveBeenCalledWith(createAppointmentDto);
      expect(result).toEqual(expectedAppointment);
    });
  });

  describe('findAll', () => {
    it('should return an array of appointments', async () => {
      const expectedAppointments = [new Appointment()];
      mockAppointmentService.findAll.mockResolvedValue(expectedAppointments);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedAppointments);
    });
  });

  describe('findByUserId', () => {
    it('should return appointments for a given user ID', async () => {
      const userId = '1';
      const expectedAppointments = [new Appointment()];
      mockAppointmentService.findByUserId.mockResolvedValue(expectedAppointments);

      const result = await controller.findByUserId(userId);

      expect(service.findByUserId).toHaveBeenCalledWith(+userId);
      expect(result).toEqual(expectedAppointments);
    });
  });

  describe('findByPractitionerId', () => {
    it('should return appointments for a given practitioner ID', async () => {
      const practitionerId = '1';
      const expectedAppointments = [new Appointment()];
      mockAppointmentService.findByPractitionerId.mockResolvedValue(expectedAppointments);

      const result = await controller.findByPractitionerId(practitionerId);

      expect(service.findByPractitionerId).toHaveBeenCalledWith(+practitionerId);
      expect(result).toEqual(expectedAppointments);
    });
  });
});