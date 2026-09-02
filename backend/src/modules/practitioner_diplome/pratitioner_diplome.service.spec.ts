import { Test, TestingModule } from '@nestjs/testing';
import { PractitionerDiplomeService } from './practitioner_diplome.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PractitionerDiplome } from './entities/practitioner_diplome.entity';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreatePractitionerDiplomeDto } from './dto/create-practitioner_diplome.dto';
import {
  UUID_A,
  UUID_B,
  UUID_C,
  UUID_D,
  UUID_E,
  UUID_MISSING,
} from '../../common/testing/uuid.fixtures';

describe('PractitionerDiplomeService', () => {
  let service: PractitionerDiplomeService;
  let repository: Repository<PractitionerDiplome>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PractitionerDiplomeService,
        {
          provide: getRepositoryToken(PractitionerDiplome),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PractitionerDiplomeService>(
      PractitionerDiplomeService,
    );
    repository = module.get<Repository<PractitionerDiplome>>(
      getRepositoryToken(PractitionerDiplome),
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreatePractitionerDiplomeDto = {
      diplome: 'Master Kinésithérapie',
      school: 'Université de Paris',
      country: 'France',
      year: 2020,
    };

    it('crée un diplôme sans profil associé', async () => {
      const diplome = new PractitionerDiplome();
      mockRepository.create.mockReturnValue(diplome);
      mockRepository.save.mockResolvedValue(diplome);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(diplome);
      expect(result).toEqual(diplome);
    });

    it('crée un diplôme lié à un profil praticien', async () => {
      const diplome = new PractitionerDiplome();
      mockRepository.create.mockReturnValue(diplome);
      mockRepository.save.mockResolvedValue(diplome);

      await service.create(dto, UUID_E);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        practitionerProfile: { id: UUID_E },
      });
    });
  });

  describe('findAll', () => {
    it('retourne tous les diplômes avec leur profil', async () => {
      const diplomes = [new PractitionerDiplome(), new PractitionerDiplome()];
      mockRepository.find.mockResolvedValue(diplomes);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['practitionerProfile'],
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('findByProfile', () => {
    it("retourne les diplômes d'un praticien", async () => {
      const diplomes = [new PractitionerDiplome()];
      mockRepository.find.mockResolvedValue(diplomes);

      const result = await service.findByProfile(UUID_C);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { practitionerProfile: { id: UUID_C } },
      });
      expect(result).toEqual(diplomes);
    });
  });

  describe('findOne', () => {
    it('retourne le diplôme correspondant', async () => {
      const diplome = new PractitionerDiplome();
      mockRepository.findOne.mockResolvedValue(diplome);

      const result = await service.findOne(UUID_A);

      // Le propriétaire du profil est chargé pour permettre le contrôle d'accès.
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: UUID_A },
        relations: ['practitionerProfile', 'practitionerProfile.user'],
      });
      expect(result).toEqual(diplome);
    });

    it('lève NotFoundException si non trouvé', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(UUID_MISSING)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // SEC-04/07 : chaque accès ciblé vérifie que le diplôme appartient bien au
  // praticien appelant.
  const ownedBy = (userId: string) =>
    Object.assign(new PractitionerDiplome(), {
      year: 2018,
      practitionerProfile: { id: UUID_C, user: { id: userId } },
    });

  describe('findOneOwnedBy', () => {
    it('retourne le diplôme de son propriétaire', async () => {
      const diplome = ownedBy(UUID_D);
      mockRepository.findOne.mockResolvedValue(diplome);

      await expect(service.findOneOwnedBy(UUID_A, UUID_D)).resolves.toBe(
        diplome,
      );
    });

    it("refuse le diplôme d'un autre praticien", async () => {
      mockRepository.findOne.mockResolvedValue(ownedBy(UUID_D));

      await expect(service.findOneOwnedBy(UUID_A, UUID_B)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('autorise un administrateur', async () => {
      const diplome = ownedBy(UUID_D);
      mockRepository.findOne.mockResolvedValue(diplome);

      await expect(service.findOneOwnedBy(UUID_A, UUID_B, true)).resolves.toBe(
        diplome,
      );
    });
  });

  describe('update', () => {
    it('met à jour et sauvegarde le diplôme', async () => {
      const diplome = ownedBy(UUID_D);
      mockRepository.findOne.mockResolvedValue(diplome);
      mockRepository.save.mockResolvedValue({ ...diplome, year: 2022 });

      const result = await service.update(UUID_A, { year: 2022 }, UUID_D);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.year).toBe(2022);
    });

    it("refuse la mise à jour du diplôme d'un tiers", async () => {
      mockRepository.findOne.mockResolvedValue(ownedBy(UUID_D));

      await expect(
        service.update(UUID_A, { year: 2022 }, UUID_B),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('lève NotFoundException si non trouvé', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(
        service.update(UUID_MISSING, { year: 2022 }, UUID_D),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('supprime le diplôme', async () => {
      const diplome = ownedBy(UUID_D);
      mockRepository.findOne.mockResolvedValue(diplome);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(UUID_A, UUID_D);

      expect(mockRepository.remove).toHaveBeenCalledWith(diplome);
    });

    it("refuse la suppression du diplôme d'un tiers", async () => {
      mockRepository.findOne.mockResolvedValue(ownedBy(UUID_D));

      await expect(service.remove(UUID_A, UUID_B)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });

    it('lève NotFoundException si non trouvé', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(UUID_MISSING, UUID_D)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
