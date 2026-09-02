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
import {
  UUID_A,
  UUID_B,
  UUID_C,
  UUID_MISSING,
} from '../../common/testing/uuid.fixtures';

const asUser = (userId: string, role: UserRole = UserRole.USER) =>
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
        practitionerId: UUID_A,
        startTime: new Date().toISOString(),
      };
      const expectedAppointment = new Appointment();
      mockAppointmentService.create.mockResolvedValue(expectedAppointment);

      const result = await controller.create(
        createAppointmentDto,
        asUser(UUID_C),
      );

      // SEC-07 : le patient est celui du jeton.
      expect(service.create).toHaveBeenCalledWith({
        ...createAppointmentDto,
        patientId: UUID_C,
      });
      expect(result).toEqual(expectedAppointment);
    });

    it('ignore un patientId imposé par le client', async () => {
      mockAppointmentService.create.mockResolvedValue(new Appointment());

      await controller.create(
        {
          patientId: UUID_MISSING,
          practitionerId: UUID_A,
          startTime: new Date().toISOString(),
        },
        asUser(UUID_C),
      );

      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({ patientId: UUID_C }),
      );
    });

    it('autorise un administrateur à réserver pour un tiers', async () => {
      mockAppointmentService.create.mockResolvedValue(new Appointment());

      await controller.create(
        {
          patientId: UUID_MISSING,
          practitionerId: UUID_A,
          startTime: new Date().toISOString(),
        },
        asUser(UUID_C, UserRole.ADMIN),
      );

      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({ patientId: UUID_MISSING }),
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

      const result = await controller.findByUserId(UUID_A, asUser(UUID_A));

      expect(service.findByUserId).toHaveBeenCalledWith(UUID_A);
      expect(result).toEqual(expectedAppointments);
    });

    // SEC-04/07 : l'agenda médical d'un autre patient n'est plus lisible.
    it("refuse l'agenda d'un autre patient", () => {
      expect(() => controller.findByUserId(UUID_B, asUser(UUID_A))).toThrow(
        ForbiddenException,
      );
      expect(service.findByUserId).not.toHaveBeenCalled();
    });
  });

  describe('findByPractitionerId', () => {
    it('should return appointments for a given practitioner ID', async () => {
      const expectedAppointments = [new Appointment()];
      mockPractitionerProfileService.findForUser.mockResolvedValue({
        id: UUID_A,
      });
      mockAppointmentService.findByPractitionerId.mockResolvedValue(
        expectedAppointments,
      );

      const result = await controller.findByPractitionerId(
        UUID_A,
        asUser(UUID_C, UserRole.PRACTITIONER),
      );

      expect(service.findByPractitionerId).toHaveBeenCalledWith(UUID_A);
      expect(result).toEqual(expectedAppointments);
    });

    // SEC-04/07
    it("refuse l'agenda d'un autre praticien", async () => {
      mockPractitionerProfileService.findForUser.mockResolvedValue({
        id: UUID_B,
      });

      await expect(
        controller.findByPractitionerId(
          UUID_A,
          asUser(UUID_C, UserRole.PRACTITIONER),
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(service.findByPractitionerId).not.toHaveBeenCalled();
    });
  });
});
