import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from './availability.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Availability } from './entities/availability.entity';
import { Repository } from 'typeorm';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let repository: Repository<Availability>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
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
        practitionerId: 1,
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
});
