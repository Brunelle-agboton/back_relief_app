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

const asUser = (userId: number, role: UserRole = UserRole.PRACTITIONER) =>
  ({ user: { userId, email: 'pro@test.com', role } }) as AuthenticatedRequest;

describe('PractitionerProfileController', () => {
  let controller: PractitionerProfileController;
  let service: PractitionerProfileService;

  const mockPractitionerProfileService = {
    create: jest.fn((dto) => Promise.resolve({ id: 1, ...dto })),
    findAll: jest.fn(() => Promise.resolve([])),
    findOne: jest.fn((id) => Promise.resolve({ id, name: 'Test' })),
    update: jest.fn((id, dto) => Promise.resolve({ id, ...dto })),
    remove: jest.fn((id) => Promise.resolve({ id })),
    findForUser: jest.fn((userId) =>
      Promise.resolve({ id: 1, userId, name: 'Test' }),
    ),
    findByEmail: jest.fn((email) => Promise.resolve({ email, name: 'Test' })),
    findPublicByEmail: jest.fn(() =>
      Promise.resolve({ id: 1, availabilities: [] }),
    ),
    addAvailability: jest.fn((profileId, dto) =>
      Promise.resolve({ profileId, ...dto }),
    ),
    completePractionerProfile: jest.fn((id, dto) =>
      Promise.resolve({ id, ...dto }),
    ),
    assertOwnedBy: jest.fn(() => Promise.resolve({ id: 1 })),
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
      expect(result).toEqual({ id: 1, ...dto });
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
      const result = await controller.findOne(1, asUser(5));
      expect(service.assertOwnedBy).toHaveBeenCalledWith(1, 5);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, name: 'Test' });
    });
  });

  describe('update', () => {
    it('should update a practitionerProfile', async () => {
      const dto = new UpdatePractitionerProfileDto();
      const result = await controller.update(1, dto, asUser(5));
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ id: 1, ...dto });
    });

    // SEC-07 : aucun contrôle de propriété n'existait sur cette route.
    it('vérifie la propriété du profil avant modification', async () => {
      mockPractitionerProfileService.assertOwnedBy.mockRejectedValueOnce(
        new ForbiddenException('Accès limité à votre propre profil praticien'),
      );

      await expect(
        controller.update(2, new UpdatePractitionerProfileDto(), asUser(5)),
      ).rejects.toThrow(ForbiddenException);
      expect(service.update).not.toHaveBeenCalled();
    });

    it("refuse un appelant qui n'est pas praticien", async () => {
      await expect(
        controller.update(
          1,
          new UpdatePractitionerProfileDto(),
          asUser(5, UserRole.USER),
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(service.assertOwnedBy).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a practitionerProfile', async () => {
      const result = await controller.remove(1, asUser(5));
      expect(service.assertOwnedBy).toHaveBeenCalledWith(1, 5);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('getProfile', () => {
    it('should return the practitioner profile for the current user', async () => {
      const result = await controller.getProfile(asUser(1));
      expect(service.findForUser).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, userId: 1, name: 'Test' });
    });
  });

  describe('getProfileByEmail', () => {
    // SEC-04 : plus d'énumération — seules les adresses publiées répondent.
    it('renvoie une projection publique pour une adresse publiée', async () => {
      const result = await controller.getProfileByEmail('public@test.com');
      expect(service.findPublicByEmail).toHaveBeenCalledWith('public@test.com');
      expect(result).toEqual({ id: 1, availabilities: [] });
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
      await controller.addAvailability(asUser(42), dto);
      expect(service.findForUser).toHaveBeenCalledWith(42);
      expect(service.addAvailability).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('completePractionerProfile', () => {
    it('should complete the practitioner profile', async () => {
      const dto = new CompletePractitionerProfileDto();
      const result = await controller.completePractionerProfile(
        1,
        dto,
        asUser(5),
      );
      expect(service.assertOwnedBy).toHaveBeenCalledWith(1, 5);
      expect(service.completePractionerProfile).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });
});
