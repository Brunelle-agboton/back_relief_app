import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PractitionerProfileController } from './practitioner_profile.controller';
import { PractitionerProfileService } from './practitioner_profile.service';
import { CreatePractitionerProfileDto } from './dto/create-practitioner_profile.dto';
import { UpdatePractitionerProfileDto } from './dto/update-practitioner_profile.dto';
import { CompletePractitionerProfileDto } from './dto/complete-practitioner_profile.dto';
import { AddAvailabilityToPractitionerDto } from './dto/add-availability-to-practitioner.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import {
  UUID_A,
  UUID_B,
  UUID_C,
  UUID_D,
  UUID_E,
  UUID_MISSING,
} from '../../common/testing/uuid.fixtures';

const asUser = (userId: string, role: UserRole = UserRole.PRACTITIONER) =>
  ({ user: { userId, email: 'pro@test.com', role } }) as AuthenticatedRequest;

describe('PractitionerProfileController', () => {
  let controller: PractitionerProfileController;
  let service: PractitionerProfileService;

  const mockPractitionerProfileService = {
    create: jest.fn((dto) => Promise.resolve({ id: UUID_A, ...dto })),
    findAll: jest.fn(() => Promise.resolve([])),
    findOne: jest.fn((id) => Promise.resolve({ id, name: 'Test' })),
    update: jest.fn((id, dto) => Promise.resolve({ id, ...dto })),
    remove: jest.fn((id) => Promise.resolve({ id })),
    findForUser: jest.fn((userId) =>
      Promise.resolve({ id: UUID_A, userId, name: 'Test' }),
    ),
    findByEmail: jest.fn((email) => Promise.resolve({ email, name: 'Test' })),
    findPublicByEmail: jest.fn(() =>
      Promise.resolve({ id: UUID_A, availabilities: [] }),
    ),
    addAvailability: jest.fn((profileId, dto) =>
      Promise.resolve({ profileId, ...dto }),
    ),
    completePractionerProfile: jest.fn((id, dto) =>
      Promise.resolve({ id, ...dto }),
    ),
    assertOwnedBy: jest.fn(() => Promise.resolve({ id: UUID_A })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.PUBLIC_PRACTITIONER_EMAILS = 'public@test.com';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PractitionerProfileController],
      providers: [
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

    controller = module.get<PractitionerProfileController>(
      PractitionerProfileController,
    );
    service = module.get<PractitionerProfileService>(
      PractitionerProfileService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a practitionerProfile', async () => {
      const dto = new CreatePractitionerProfileDto();
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: UUID_A, ...dto });
    });
  });

  describe('findAll', () => {
    it('should return all practitionerProfile', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a practitionerProfile', async () => {
      const result = await controller.findOne(UUID_A, asUser(UUID_E));
      expect(service.assertOwnedBy).toHaveBeenCalledWith(UUID_A, UUID_E);
      expect(service.findOne).toHaveBeenCalledWith(UUID_A);
      expect(result).toEqual({ id: UUID_A, name: 'Test' });
    });
  });

  describe('update', () => {
    it('should update a practitionerProfile', async () => {
      const dto = new UpdatePractitionerProfileDto();
      const result = await controller.update(UUID_A, dto, asUser(UUID_E));
      expect(service.update).toHaveBeenCalledWith(UUID_A, dto);
      expect(result).toEqual({ id: UUID_A, ...dto });
    });

    // SEC-07 : aucun contrôle de propriété n'existait sur cette route.
    it('vérifie la propriété du profil avant modification', async () => {
      mockPractitionerProfileService.assertOwnedBy.mockRejectedValueOnce(
        new ForbiddenException('Accès limité à votre propre profil praticien'),
      );

      await expect(
        controller.update(
          UUID_B,
          new UpdatePractitionerProfileDto(),
          asUser(UUID_E),
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(service.update).not.toHaveBeenCalled();
    });

    it("refuse un appelant qui n'est pas praticien", async () => {
      await expect(
        controller.update(
          UUID_A,
          new UpdatePractitionerProfileDto(),
          asUser(UUID_E, UserRole.USER),
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(service.assertOwnedBy).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a practitionerProfile', async () => {
      const result = await controller.remove(UUID_A, asUser(UUID_E));
      expect(service.assertOwnedBy).toHaveBeenCalledWith(UUID_A, UUID_E);
      expect(service.remove).toHaveBeenCalledWith(UUID_A);
      expect(result).toEqual({ id: UUID_A });
    });
  });

  describe('getProfile', () => {
    it('should return the practitioner profile for the current user', async () => {
      const result = await controller.getProfile(asUser(UUID_A));
      expect(service.findForUser).toHaveBeenCalledWith(UUID_A);
      expect(result).toEqual({ id: UUID_A, userId: UUID_A, name: 'Test' });
    });
  });

  describe('getProfileByEmail', () => {
    // SEC-04 : plus d'énumération — seules les adresses publiées répondent.
    it('renvoie une projection publique pour une adresse publiée', async () => {
      const result = await controller.getProfileByEmail('public@test.com');
      expect(service.findPublicByEmail).toHaveBeenCalledWith('public@test.com');
      expect(result).toEqual({ id: UUID_A, availabilities: [] });
    });

    it('renvoie 404 pour toute adresse non publiée, sans interroger la base', () => {
      expect(() => controller.getProfileByEmail('prive@test.com')).toThrow(
        NotFoundException,
      );
      expect(service.findPublicByEmail).not.toHaveBeenCalled();
      expect(service.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('addAvailability', () => {
    // SEC-07 : le profil cible provenait du corps de requête.
    it("rattache le créneau au profil de l'appelant", async () => {
      const dto = new AddAvailabilityToPractitionerDto();
      await controller.addAvailability(asUser(UUID_D), dto);
      expect(service.findForUser).toHaveBeenCalledWith(UUID_D);
      expect(service.addAvailability).toHaveBeenCalledWith(UUID_A, dto);
    });
  });

  describe('completePractionerProfile', () => {
    it('should complete the practitioner profile', async () => {
      const dto = new CompletePractitionerProfileDto();
      const result = await controller.completePractionerProfile(
        UUID_A,
        dto,
        asUser(UUID_E),
      );
      expect(service.assertOwnedBy).toHaveBeenCalledWith(UUID_A, UUID_E);
      expect(service.completePractionerProfile).toHaveBeenCalledWith(
        UUID_A,
        dto,
      );
      expect(result).toEqual({ id: UUID_A, ...dto });
    });
  });
});
