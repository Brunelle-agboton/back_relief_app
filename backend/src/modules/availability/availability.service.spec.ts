import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from './availability.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Availability } from './entities/availability.entity';
import { Repository } from 'typeorm';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { PractitionerProfile } from '../practitioner_profile/entities/practitioner_profile.entity'

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let repository: Repository<Availability>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: getRepositoryToken(Availability),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    repository = module.get<Repository<Availability>>(getRepositoryToken(Availability));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save an availability', async () => {
      const createAvailabilityDto: CreateAvailabilityDto = {
        practitionerProfile: new PractitionerProfile(),
        startTime: new Date(),
        endTime: new Date(),
        timezone: 'UTC',
      };
      const availability = new Availability();
      mockRepository.create.mockReturnValue(availability);
      mockRepository.save.mockResolvedValue(availability);

      const result = await service.create(createAvailabilityDto);

      expect(repository.create).toHaveBeenCalledWith(createAvailabilityDto);
      expect(repository.save).toHaveBeenCalledWith(availability);
      expect(result).toEqual(availability);
    });
  });

  describe('findAll', () => {
    it('should return an array of availabilities', async () => {
      const availabilities = [new Availability()];
      mockRepository.find.mockResolvedValue(availabilities);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(availabilities);
    });
  });

  describe('update', () => {
    it('should update an availability', async () => {
      const availability = new Availability();
      availability.id = 1;
      const updatedAvailability = { ...availability, isBooked: true };
      mockRepository.save.mockResolvedValue(updatedAvailability);

      const result = await service.update(1, updatedAvailability);

      expect(mockRepository.save).toHaveBeenCalledWith(updatedAvailability);
      expect(result).toEqual(updatedAvailability);
    });

    it('should throw a BadRequestException if ID in path does not match entity ID', async () => {
      const availability = new Availability();
      availability.id = 1;

      await expect(service.update(2, availability)).rejects.toThrow('ID in path does not match entity ID.');
    });
  });

  describe('findExactSlot', () => {
    it('should return an exact availability slot', async () => {
      const practitionerProfileId = 1;
      const startTime = new Date();
      const endTime = new Date();
      const availability = new Availability();
      mockRepository.findOne.mockResolvedValue(availability);

      const result = await service.findExactSlot(practitionerProfileId, startTime, endTime);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          practitionerProfile: { id: practitionerProfileId },
          startTime: startTime,
          endTime: endTime,
          isBooked: false,
        },
      });
      expect(result).toEqual(availability);
    });

    it('should return null if no exact availability slot is found', async () => {
      const practitionerProfileId = 1;
      const startTime = new Date();
      const endTime = new Date();
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findExactSlot(practitionerProfileId, startTime, endTime);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          practitionerProfile: { id: practitionerProfileId },
          startTime: startTime,
          endTime: endTime,
          isBooked: false,
        },
      });
      expect(result).toBeNull();
    });
  });
});
