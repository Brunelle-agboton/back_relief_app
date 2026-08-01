import { Test, TestingModule } from '@nestjs/testing';
import { PractitionerDiplomeController } from './practitioner_diplome.controller';
import { PractitionerDiplomeService } from './practitioner_diplome.service';
import { PractitionerDiplome } from './entities/practitioner_diplome.entity';
import { CreatePractitionerDiplomeDto } from './dto/create-practitioner_diplome.dto';

describe('PratitionerDiplomeController', () => {
  let controller: PractitionerDiplomeController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PractitionerDiplomeController],
      providers: [{ provide: PractitionerDiplomeService, useValue: mockService }],
    }).compile();

    controller = module.get<PractitionerDiplomeController>(PractitionerDiplomeController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('crée un diplôme', async () => {
      const dto: CreatePractitionerDiplomeDto = { diplome: 'Master', school: 'Paris', country: 'France', year: 2020 };
      const diplome = new PractitionerDiplome();
      mockService.create.mockResolvedValue(diplome);

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(diplome);
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
    it('retourne un diplôme par id', async () => {
      const diplome = new PractitionerDiplome();
      mockService.findOne.mockResolvedValue(diplome);

      const result = await controller.findOne('1');

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(diplome);
    });
  });

  describe('update', () => {
    it('met à jour un diplôme', async () => {
      const diplome = new PractitionerDiplome();
      mockService.update.mockResolvedValue(diplome);

      const result = await controller.update('1', { year: 2022 });

      expect(mockService.update).toHaveBeenCalledWith(1, { year: 2022 });
      expect(result).toEqual(diplome);
    });
  });

  describe('remove', () => {
    it('supprime un diplôme', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });
  });
});
