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
      const painRecord = new PainRecord();
      painRecord.painLocation = 'head';
      painRecord.painLevel = 5;
      painRecord.painDescription = 'headache';
      mockPainRecordRepository.find.mockResolvedValue([painRecord]);
      mockActivityRepository.find.mockResolvedValue([]);
      mockExerciseRepository.findOne.mockResolvedValue(null);

      const result = await service.getPainsLatest(user);

      expect(painRecordRepository.find).toHaveBeenCalled();
      expect(activityRepository.find).toHaveBeenCalled();
      expect(result.lastPainByLocation).toEqual({ head: { level: 5, desc: 'headache' } });
    });

    it('should return null for exercise if not found', async () => {
      const user = new User();
      const activity = new Activity();
      activity.metadata = JSON.stringify({ exerciceId: 1 });
      mockPainRecordRepository.find.mockResolvedValue([]);
      mockActivityRepository.find.mockResolvedValue([activity]);
      mockExerciseRepository.findOne.mockResolvedValue(null);

      const result = await service.getPainsLatest(user);

      expect(result.exercises).toEqual([null]);
    });

    it('should return exercise details if found', async () => {
      const user = new User();
      const activity = new Activity();
      activity.metadata = JSON.stringify({ exerciceId: 1 });
      const exercise = new Exercise();
      exercise.id = 1;
      exercise.title = 'test exercise';
      exercise.image = 'test.jpg';
      mockPainRecordRepository.find.mockResolvedValue([]);
      mockActivityRepository.find.mockResolvedValue([activity]);
      mockExerciseRepository.findOne.mockResolvedValue(exercise);

      const result = await service.getPainsLatest(user);

      expect(result.exercises).toEqual([{ id: 1, title: 'test exercise', image: 'test.jpg' }]);
    });
  });

  describe('setHydratation', () => {
    it('should save a hydration record', async () => {
      const size = '500ml';
      const hydrationRecord = new HydrationRecord();
      mockHydrationRecordRepository.save.mockResolvedValue(hydrationRecord);

      const result = await service.setHydratation(size);

      expect(hydrationRecordRepository.save).toHaveBeenCalledWith({
        bottleSize: size,
        recordedAt: expect.any(Date),
      });
      expect(result).toEqual(hydrationRecord);
    });
  });

  describe('latestHydratation', () => {
    it('should return latest hydratation', async () => {
      const user = new User();
      const hydrationRecord = new HydrationRecord();
      hydrationRecord.bottleSize = '500ml';
      mockHydrationRecordRepository.find.mockResolvedValue([hydrationRecord]);

      const result = await service.latestHydratation(user);

      expect(hydrationRecordRepository.find).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
        order: { recordedAt: 'DESC' },
        take: 2,
      });
      expect(result).toEqual('500ml');
    });

    it('should return null if no hydration record is found', async () => {
      const user = new User();
      mockHydrationRecordRepository.find.mockResolvedValue([]);

      const result = await service.latestHydratation(user);

      expect(hydrationRecordRepository.find).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return "This action returns all health" ', async () => {
      expect(await service.findAll()).toBe('This action returns all health');
    });
  });

  describe('findOne', () => {
    it('should return "This action returns a #1 health" ', async () => {
      expect(await service.findOne(1)).toBe('This action returns a #1 health');
    });
  });

  describe('update', () => {
    it('should return "This action updates a #1 health" ', async () => {
      const dto: PainInputDto = { painLocation: 'Bas du dos', painLevel: 5, painDescription: '', user: new User(), recordedAt: new Date() };
      expect(await service.update(1, dto)).toBe('This action updates a #1 health');
    });
  });

  describe('remove', () => {
    it('should return "This action removes a #1 health" ', async () => {
      expect(await service.remove(1)).toBe('This action removes a #1 health');
    });
  });
});