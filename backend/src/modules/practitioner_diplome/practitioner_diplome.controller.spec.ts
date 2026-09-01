import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { PractitionerDiplomeController } from './practitioner_diplome.controller';
import { PractitionerDiplomeService } from './practitioner_diplome.service';
import { PractitionerProfileService } from '../practitioner_profile/practitioner_profile.service';
import { PractitionerDiplome } from './entities/practitioner_diplome.entity';
import { CreatePractitionerDiplomeDto } from './dto/create-practitioner_diplome.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';

const asUser = (userId: number, role: UserRole = UserRole.PRACTITIONER) =>
  ({ user: { userId, email: 'pro@test.com', role } }) as AuthenticatedRequest;

describe('PratitionerDiplomeController', () => {
  let controller: PractitionerDiplomeController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOneOwnedBy: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockProfileService = {
    findForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PractitionerDiplomeController],
      providers: [
        { provide: PractitionerDiplomeService, useValue: mockService },
        { provide: PractitionerProfileService, useValue: mockProfileService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PractitionerDiplomeController>(
      PractitionerDiplomeController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it("rattache le diplôme au profil praticien de l'appelant", async () => {
      const dto: CreatePractitionerDiplomeDto = {
        diplome: 'Master',
        school: 'Paris',
        country: 'France',
        year: 2020,
      };
      const diplome = new PractitionerDiplome();
      mockProfileService.findForUser.mockResolvedValue({ id: 12 });
      mockService.create.mockResolvedValue(diplome);

      const result = await controller.create(dto, asUser(4));

      expect(mockProfileService.findForUser).toHaveBeenCalledWith(4);
      expect(mockService.create).toHaveBeenCalledWith(dto, 12);
      expect(result).toEqual(diplome);
    });

    it("refuse un appelant qui n'est pas praticien", async () => {
      const dto: CreatePractitionerDiplomeDto = {
        diplome: 'Master',
        school: 'Paris',
        country: 'France',
        year: 2020,
      };

      await expect(
        controller.create(dto, asUser(4, UserRole.USER)),
      ).rejects.toThrow(ForbiddenException);
      expect(mockService.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retourne tous les diplômes', async () => {
      const diplomes = [new PractitionerDiplome()];
      mockService.findAll.mockResolvedValue(diplomes);

      const result = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toEqual(diplomes);
    });
  });

  describe('findOne', () => {
    // SEC-04 : la lecture est bornée au praticien propriétaire.
    it('retourne un diplôme par id en vérifiant la propriété', async () => {
      const diplome = new PractitionerDiplome();
      mockService.findOneOwnedBy.mockResolvedValue(diplome);

      const result = await controller.findOne(1, asUser(4));

      expect(mockService.findOneOwnedBy).toHaveBeenCalledWith(1, 4, false);
      expect(result).toEqual(diplome);
    });
  });

  describe('update', () => {
    it('met à jour un diplôme en vérifiant la propriété', async () => {
      const diplome = new PractitionerDiplome();
      mockService.update.mockResolvedValue(diplome);

      const result = await controller.update(1, { year: 2022 }, asUser(4));

      expect(mockService.update).toHaveBeenCalledWith(
        1,
        { year: 2022 },
        4,
        false,
      );
      expect(result).toEqual(diplome);
    });
  });

  describe('remove', () => {
    it('supprime un diplôme en vérifiant la propriété', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1, asUser(4));

      expect(mockService.remove).toHaveBeenCalledWith(1, 4, false);
    });
  });
});
