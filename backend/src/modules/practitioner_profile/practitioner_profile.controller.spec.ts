import { Test, TestingModule } from '@nestjs/testing';
import { PractitionerProfileController } from './practitioner_profile.controller';
import { PractitionerProfileService } from './practitioner_profile.service';
import { CreatePractitionerProfileDto } from './dto/create-practitioner_profile.dto';
import { UpdatePractitionerProfileDto } from './dto/update-practitioner_profile.dto';

describe('PractitionerProfileController', () => {
  let controller: PractitionerProfileController;
  let service: PractitionerProfileService;

  const mockPractitionerProfileService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PractitionerProfileController],
      providers: [
        {
          provide: PractitionerProfileService,
          useValue: mockPractitionerProfileService,
        },
      ],
    }).compile();

    controller = module.get<PractitionerProfileController>(PractitionerProfileController);
    service = module.get<PractitionerProfileService>(PractitionerProfileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a practitionerProfile', () => {
      const dto = new CreatePractitionerProfileDto();
      controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all practitionerProfile', () => {
      controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a practitionerProfile', () => {
      controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a practitionerProfile', () => {
      const dto = new UpdatePractitionerProfileDto();
      controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a practitionerProfile', () => {
      controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});