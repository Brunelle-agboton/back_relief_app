import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { PractitionerProfileService } from '../practitioner_profile/practitioner_profile.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { ForbiddenException } from '@nestjs/common';

const asUser = (userId: number, role: UserRole = UserRole.USER) =>
  ({ user: { userId, email: 'a@a.com', role } }) as AuthenticatedRequest;

describe('AppointmentController', () => {
  let controller: AppointmentController;
  let service: AppointmentService;

  const mockAppointmentService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUserId: jest.fn(),
    findByPractitionerId: jest.fn(),
  };

  const mockPractitionerProfileService = {
    findForUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        {
          provide: AppointmentService,
          useValue: mockAppointmentService,
        },
        {
          provide: PractitionerProfileService,
          useValue: mockPractitionerProfileService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AppointmentController>(AppointmentController);
    service = module.get<AppointmentService>(AppointmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an appointment', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        practitionerId: 1,
        startTime: new Date().toISOString(),
      };
      const expectedAppointment = new Appointment();
      mockAppointmentService.create.mockResolvedValue(expectedAppointment);

      const result = await controller.create(createAppointmentDto, asUser(7));

      // SEC-07 : le patient est celui du jeton.
      expect(service.create).toHaveBeenCalledWith({
        ...createAppointmentDto,
        patientId: 7,
      });
      expect(result).toEqual(expectedAppointment);
    });

    it('ignore un patientId imposé par le client', async () => {
      mockAppointmentService.create.mockResolvedValue(new Appointment());

      await controller.create(
        {
          patientId: 999,
          practitionerId: 1,
          startTime: new Date().toISOString(),
        },
        asUser(7),
      );

      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({ patientId: 7 }),
      );
    });

    it('autorise un administrateur à réserver pour un tiers', async () => {
      mockAppointmentService.create.mockResolvedValue(new Appointment());

      await controller.create(
        {
          patientId: 999,
          practitionerId: 1,
          startTime: new Date().toISOString(),
        },
        asUser(7, UserRole.ADMIN),
      );

      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({ patientId: 999 }),
      );
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
      const expectedAppointments = [new Appointment()];
      mockAppointmentService.findByUserId.mockResolvedValue(
        expectedAppointments,
      );

      const result = await controller.findByUserId(1, asUser(1));

      expect(service.findByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedAppointments);
    });

    // SEC-04/07 : l'agenda médical d'un autre patient n'est plus lisible.
    it("refuse l'agenda d'un autre patient", () => {
      expect(() => controller.findByUserId(2, asUser(1))).toThrow(
        ForbiddenException,
      );
      expect(service.findByUserId).not.toHaveBeenCalled();
    });
  });

  describe('findByPractitionerId', () => {
    it('should return appointments for a given practitioner ID', async () => {
      const expectedAppointments = [new Appointment()];
      mockPractitionerProfileService.findForUser.mockResolvedValue({ id: 1 });
      mockAppointmentService.findByPractitionerId.mockResolvedValue(
        expectedAppointments,
      );

      const result = await controller.findByPractitionerId(
        1,
        asUser(5, UserRole.PRACTITIONER),
      );

      expect(service.findByPractitionerId).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedAppointments);
    });

    // SEC-04/07
    it("refuse l'agenda d'un autre praticien", async () => {
      mockPractitionerProfileService.findForUser.mockResolvedValue({ id: 2 });

      await expect(
        controller.findByPractitionerId(1, asUser(5, UserRole.PRACTITIONER)),
      ).rejects.toThrow(ForbiddenException);
      expect(service.findByPractitionerId).not.toHaveBeenCalled();
    });
  });
});
