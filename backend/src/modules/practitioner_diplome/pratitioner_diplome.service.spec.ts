import { Test, TestingModule } from '@nestjs/testing';
import { PractitionerDiplomeService } from './practitioner_diplome.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PractitionerDiplome } from './entities/practitioner_diplome.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreatePractitionerDiplomeDto } from './dto/create-practitioner_diplome.dto';

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
        { provide: getRepositoryToken(PractitionerDiplome), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<PractitionerDiplomeService>(PractitionerDiplomeService);
    repository = module.get<Repository<PractitionerDiplome>>(getRepositoryToken(PractitionerDiplome));
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

      await service.create(dto, 5);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        practitionerProfile: { id: 5 },
      });
    });
  });

  describe('findAll', () => {
    it('retourne tous les diplômes avec leur profil', async () => {
      const diplomes = [new PractitionerDiplome(), new PractitionerDiplome()];
      mockRepository.find.mockResolvedValue(diplomes);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['practitionerProfile'] });
      expect(result).toHaveLength(2);
    });
  });

  describe('findByProfile', () => {
    it('retourne les diplômes d\'un praticien', async () => {
      const diplomes = [new PractitionerDiplome()];
      mockRepository.find.mockResolvedValue(diplomes);

      const result = await service.findByProfile(3);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { practitionerProfile: { id: 3 } },
      });
      expect(result).toEqual(diplomes);
    });
  });

  describe('findOne', () => {
    it('retourne le diplôme correspondant', async () => {
      const diplome = new PractitionerDiplome();
      mockRepository.findOne.mockResolvedValue(diplome);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['practitionerProfile'],
      });
      expect(result).toEqual(diplome);
    });

    it('lève NotFoundException si non trouvé', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('met à jour et sauvegarde le diplôme', async () => {
      const diplome = Object.assign(new PractitionerDiplome(), { year: 2018 });
      mockRepository.findOne.mockResolvedValue(diplome);
      mockRepository.save.mockResolvedValue({ ...diplome, year: 2022 });

      const result = await service.update(1, { year: 2022 });

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.year).toBe(2022);
    });

    it('lève NotFoundException si non trouvé', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(99, { year: 2022 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('supprime le diplôme', async () => {
      const diplome = new PractitionerDiplome();
      mockRepository.findOne.mockResolvedValue(diplome);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(diplome);
    });

    it('lève NotFoundException si non trouvé', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
