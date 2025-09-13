import { Test, TestingModule } from '@nestjs/testing';
import { PractitionerProfileService } from './practitioner_profile.service';
import { CreatePractitionerProfileDto } from './dto/create-practitioner_profile.dto';
import { UpdatePractitionerProfileDto } from './dto/update-practitioner_profile.dto';

describe('PractitionerProfileService', () => {
  let service: PractitionerProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PractitionerProfileService],
    }).compile();

    service = module.get<PractitionerProfileService>(PractitionerProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return a string', () => {
      const dto = new CreatePractitionerProfileDto();
      expect(service.create(dto)).toBe('This action adds a new practitionerProfile');
    });
  });

  describe('findAll', () => {
    it('should return a string', () => {
      expect(service.findAll()).toBe('This action returns all practitionerProfile');
    });
  });

  describe('findOne', () => {
    it('should return a string', () => {
      expect(service.findOne(1)).toBe('This action returns a #1 practitionerProfile');
    });
  });

  describe('update', () => {
    it('should return a string', () => {
      const dto = new UpdatePractitionerProfileDto();
      expect(service.update(1, dto)).toBe('This action updates a #1 practitionerProfile');
    });
  });

  describe('remove', () => {
    it('should return a string', () => {
      expect(service.remove(1)).toBe('This action removes a #1 practitionerProfile');
    });
  });
});