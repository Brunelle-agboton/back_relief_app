import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PainRecord, HydrationRecord } from './entities/health.entity';
import { Activity, ActivityType } from '../activity/entities/activity.entity';
import { Exercise } from '../exercise/entities/exercise.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateHealthDto } from './dto/create-health.dto';
import { PainInputDto } from './dto/pain-input.dto';

describe('HealthService', () => {
  let service: HealthService;
  let painRecordRepository: Repository<PainRecord>;
  let hydrationRecordRepository: Repository<HydrationRecord>;
  let activityRepository: Repository<Activity>;
  let exerciseRepository: Repository<Exercise>;

  const mockPainRecordRepository = {
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockHydrationRecordRepository = {
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockActivityRepository = {
    find: jest.fn(),
  };

  const mockExerciseRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getRepositoryToken(PainRecord),
          useValue: mockPainRecordRepository,
        },
        {
          provide: getRepositoryToken(HydrationRecord),
          useValue: mockHydrationRecordRepository,
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: mockActivityRepository,
        },
        {
          provide: getRepositoryToken(Exercise),
          useValue: mockExerciseRepository,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    painRecordRepository = module.get<Repository<PainRecord>>(getRepositoryToken(PainRecord));
    hydrationRecordRepository = module.get<Repository<HydrationRecord>>(getRepositoryToken(HydrationRecord));
    activityRepository = module.get<Repository<Activity>>(getRepositoryToken(Activity));
    exerciseRepository = module.get<Repository<Exercise>>(getRepositoryToken(Exercise));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPainOptions', () => {
    it('should return pain locations', () => {
      expect(service.getPainOptions()).toBeDefined();
    });
  });

  describe('submitPain', () => {
    it('should save a pain record', async () => {
      const dto: PainInputDto = { painLocation: 'Bas du dos', painLevel: 5, painDescription: '', user: new User(), recordedAt: new Date() };
      await service.submitPain(dto);
      expect(painRecordRepository.save).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should return a string', () => {
      const dto: CreateHealthDto = {};
      expect(service.create(dto)).toBe('This action adds a new health');
    });
  });

  describe('getPainsLatest', () => {
    it('should return latest pains', async () => {
      const user = new User();
      mockPainRecordRepository.find.mockResolvedValue([]);
      mockActivityRepository.find.mockResolvedValue([]);
      await service.getPainsLatest(user);
      expect(painRecordRepository.find).toHaveBeenCalled();
      expect(activityRepository.find).toHaveBeenCalled();
    });
  });

  describe('setHydratation', () => {
    it('should save a hydration record', async () => {
      const size = '500ml';
      await service.setHydratation(size);
      expect(hydrationRecordRepository.save).toHaveBeenCalled();
    });
  });

  describe('latestHydratation', () => {
    it('should return latest hydratation', async () => {
      const user = new User();
      mockHydrationRecordRepository.find.mockResolvedValue([]);
      await service.latestHydratation(user);
      expect(hydrationRecordRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a string', () => {
      expect(service.findAll()).toBe('This action returns all health');
    });
  });

  describe('findOne', () => {
    it('should return a string', () => {
      expect(service.findOne(1)).toBe('This action returns a #1 health');
    });
  });

  describe('update', () => {
    it('should return a string', () => {
      const dto: PainInputDto = { painLocation: 'Bas du dos', painLevel: 5, painDescription: '', user: new User(), recordedAt: new Date() };
      expect(service.update(1, dto)).toBe('This action updates a #1 health');
    });
  });

  describe('remove', () => {
    it('should return a string', () => {
      expect(service.remove(1)).toBe('This action removes a #1 health');
    });
  });
});