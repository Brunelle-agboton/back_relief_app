import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { Repository } from 'typeorm';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { User } from '../user/entities/user.entity';

describe('ActivityService', () => {
  let service: ActivityService;
  let repository: Repository<Activity>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: getRepositoryToken(Activity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    repository = module.get<Repository<Activity>>(getRepositoryToken(Activity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create and save an activity', async () => {
      const user = new User();
      user.id = 1;
      const createActivityDto: CreateActivityDto = {
        type: 'test' as any,
        metadata: '{}',
        user: user,
      };
      const activity = new Activity();
      mockRepository.create.mockReturnValue(activity);
      mockRepository.save.mockResolvedValue(activity);

      const result = await service.log(createActivityDto);

      expect(repository.create).toHaveBeenCalledWith(createActivityDto);
      expect(repository.save).toHaveBeenCalledWith(activity);
      expect(result).toEqual(activity);
    });
  });

  describe('findByUser', () => {
    it('should return activities for a user', async () => {
      const userId = 1;
      const activities = [new Activity()];
      mockRepository.find.mockResolvedValue(activities);

      const result = await service.findByUser(userId);

      expect(repository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(activities);
    });
  });

  describe('create', () => {
    it('should return a string', () => {
      const createActivityDto: CreateActivityDto = {
        type: 'test' as any,
        metadata: '{}',
        user: new User(),
      };
      expect(service.create(createActivityDto)).toBe('This action adds a new activity');
    });
  });

  describe('findAll', () => {
    it('should return a string', () => {
      expect(service.findAll()).toBe('This action returns all activity');
    });
  });

  describe('update', () => {
    it('should return a string', () => {
      const updateActivityDto: UpdateActivityDto = {};
      expect(service.update(1, updateActivityDto)).toBe('This action updates a #1 activity');
    });
  });

  describe('remove', () => {
    it('should return a string', () => {
      expect(service.remove(1)).toBe('This action removes a #1 activity');
    });
  });
});