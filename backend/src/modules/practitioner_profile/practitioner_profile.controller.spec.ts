import { Test, TestingModule } from '@nestjs/testing';
import { PractitionerProfileController } from './practitioner_profile.controller';
import { PractitionerProfileService } from './practitioner_profile.service';
import { CreatePractitionerProfileDto } from './dto/create-practitioner_profile.dto';
import { UpdatePractitionerProfileDto } from './dto/update-practitioner_profile.dto';
import { CompletePractitionerProfileDto } from './dto/complete-practitioner_profile.dto';
import { AddAvailabilityToPractitionerDto } from './dto/add-availability-to-practitioner.dto';
import { PractitionerProfile } from './entities/practitioner_profile.entity';

describe('PractitionerProfileController', () => {
  let controller: PractitionerProfileController;
  let service: PractitionerProfileService;

  const mockPractitionerProfileService = {
    create: jest.fn(dto => Promise.resolve({ id: 1, ...dto })),
    findAll: jest.fn(() => Promise.resolve([])),
    findOne: jest.fn(id => Promise.resolve({ id, name: 'Test' })),
    update: jest.fn((id, dto) => Promise.resolve({ id, ...dto })),
    remove: jest.fn(id => Promise.resolve({ id })),
    findForUser: jest.fn(userId => Promise.resolve({ userId, name: 'Test' })),
    findByEmail: jest.fn(email => Promise.resolve({ email, name: 'Test' })),
    addAvailability: jest.fn(dto => Promise.resolve({ ...dto })),
    completePractionerProfile: jest.fn((id, dto) => Promise.resolve({ id, ...dto })),
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
      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, name: 'Test' });
    });
  });

  describe('update', () => {
    it('should update a practitionerProfile', async () => {
      const dto = new UpdatePractitionerProfileDto();
      const result = await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('remove', () => {
    it('should remove a practitionerProfile', async () => {
      const result = await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('getProfile', () => {
    it('should return the practitioner profile for the current user', async () => {
      const req = { user: { userId: 1 } };
      const result = await controller.getProfile(req);
      expect(service.findForUser).toHaveBeenCalledWith(1);
      expect(result).toEqual({ userId: 1, name: 'Test' });
    });
  });

  describe('getProfileByEmail', () => {
    it('should return the practitioner profile for the given email', async () => {
      const email = 'test@test.com';
      const result = await controller.getProfileByEmail(email);
      expect(service.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual({ email, name: 'Test' });
    });
  });

  describe('addAvailability', () => {
    it('should add an availability to the practitioner profile', async () => {
      const dto = new AddAvailabilityToPractitionerDto();
      const req = { user: { sub: 1 } };
      const result = await controller.addAvailability(req, dto);
      expect(service.addAvailability).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ ...dto });
    });
  });

  describe('completePractionerProfile', () => {
    it('should complete the practitioner profile', async () => {
      const dto = new CompletePractitionerProfileDto();
      const result = await controller.completePractionerProfile('1', dto);
      expect(service.completePractionerProfile).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });
});
