import { Test, TestingModule } from '@nestjs/testing';
import { SummaryService } from './summary.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PainRecord, HydrationRecord } from '../health/entities/health.entity';
import { Activity, ActivityType } from '../activity/entities/activity.entity';
import { ProgramLine } from '../program-line/entities/program-line.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

describe('SummaryService', () => {
  let service: SummaryService;
  let healthRepo: Repository<PainRecord>;
  let actRepo: Repository<Activity>;
  let programLineRepo: Repository<ProgramLine>;

  const mockHealthRepo = {
    find: jest.fn(),
  };

  const mockActRepo = {
    find: jest.fn(),
  };

  const mockProgramLineRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummaryService,
        {
          provide: getRepositoryToken(PainRecord),
          useValue: mockHealthRepo,
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: mockActRepo,
        },
        {
          provide: getRepositoryToken(ProgramLine),
          useValue: mockProgramLineRepo,
        },
      ],
    }).compile();

    service = module.get<SummaryService>(SummaryService);
    healthRepo = module.get<Repository<PainRecord>>(getRepositoryToken(PainRecord));
    actRepo = module.get<Repository<Activity>>(getRepositoryToken(Activity));
    programLineRepo = module.get<Repository<ProgramLine>>(getRepositoryToken(ProgramLine));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummaryForUser', () => {
    it('should return a summary for the user', async () => {
      const user = new User();
      user.id = 1;
      user.hourSit = 8;
      user.restReminder = true;
      user.drinkReminder = false;

      mockHealthRepo.find.mockResolvedValue([]);
      mockActRepo.find.mockResolvedValue([]);
      mockProgramLineRepo.findOne.mockResolvedValue(null);

      const result = await service.getSummaryForUser(user);

      expect(healthRepo.find).toHaveBeenCalled();
      expect(actRepo.find).toHaveBeenCalled();
      expect(result).toHaveProperty('healthHistory');
      expect(result).toHaveProperty('exercises');
      expect(result).toHaveProperty('notifications');
    });
  });

  describe('getUserHealth', () => {
    it('should return health details for the user', async () => {
      const user = new User();
      user.id = 1;

      mockHealthRepo.find.mockResolvedValue([]);
      mockActRepo.find.mockResolvedValue([]);

      const result = await service.getUserHealth(user);

      expect(healthRepo.find).toHaveBeenCalled();
      expect(actRepo.find).toHaveBeenCalled();
      expect(result).toHaveProperty('painLevel');
      expect(result).toHaveProperty('nbExercises');
      expect(result).toHaveProperty('streakDays');
    });
  });
});
