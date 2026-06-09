import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { Repository } from 'typeorm';
import { CreateActivityDto } from './dto/create-activity.dto';
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

  describe('findAll', () => {
    it('should return all activities ordered by date desc', async () => {
      const activities = [new Activity(), new Activity()];
      mockRepository.find.mockResolvedValue(activities);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
      expect(result).toEqual(activities);
    });
  });

  describe('remove', () => {
    it('should delete the activity by id', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });
});