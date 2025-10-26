import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { Availability } from './entities/availability.entity';
import { PractitionerProfile } from '../practitioner_profile/entities/practitioner_profile.entity'

describe('AvailabilityController', () => {
  let controller: AvailabilityController;
  let service: AvailabilityService;

  const mockAvailabilityService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [
        {
          provide: AvailabilityService,
          useValue: mockAvailabilityService,
        },
      ],
    }).compile();

    controller = module.get<AvailabilityController>(AvailabilityController);
    service = module.get<AvailabilityService>(AvailabilityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an availability', async () => {
      const createAvailabilityDto: CreateAvailabilityDto = {
        practitionerProfile: new PractitionerProfile(),
        startTime: new Date(),
        endTime: new Date(),
        timezone: 'UTC',
      };
      const expectedAvailability = new Availability();
      mockAvailabilityService.create.mockResolvedValue(expectedAvailability);

      const result = await controller.create(createAvailabilityDto);

      expect(service.create).toHaveBeenCalledWith(createAvailabilityDto);
      expect(result).toEqual(expectedAvailability);
    });
  });

  describe('findAll', () => {
    it('should return an array of availabilities', async () => {
      const expectedAvailabilities = [new Availability()];
      mockAvailabilityService.findAll.mockResolvedValue(expectedAvailabilities);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedAvailabilities);
    });
  });
});
