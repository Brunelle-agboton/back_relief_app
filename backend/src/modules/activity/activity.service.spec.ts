import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { Repository } from 'typeorm';
import { CreateActivityDto } from './dto/create-activity.dto';
import { User } from '../user/entities/user.entity';
import {
  UUID_A,
  UUID_B,
  UUID_C,
  UUID_MISSING,
} from '../../common/testing/uuid.fixtures';

describe('ActivityService', () => {
  let service: ActivityService;
  let repository: Repository<Activity>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
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
      user.id = UUID_A;
      const createActivityDto: CreateActivityDto = {
        type: 'test' as any,
        metadata: '{}',
      };
      const activity = new Activity();
      mockRepository.create.mockReturnValue(activity);
      mockRepository.save.mockResolvedValue(activity);

      const result = await service.log(createActivityDto, user);

      expect(repository.create).toHaveBeenCalledWith({
        ...createActivityDto,
        user,
      });
      expect(repository.save).toHaveBeenCalledWith(activity);
      expect(result).toEqual(activity);
    });
  });

  describe('findByUser', () => {
    it('should return activities for a user', async () => {
      const userId = UUID_A;
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

      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(activities);
    });
  });

  describe('remove', () => {
    it('should delete the activity by id', async () => {
      const owner = new User();
      owner.id = UUID_C;
      const activity = new Activity();
      activity.user = owner;
      mockRepository.findOne.mockResolvedValue(activity);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(UUID_A, UUID_C);

      expect(repository.delete).toHaveBeenCalledWith(UUID_A);
    });

    // SEC-07
    it("refuse la suppression d'une activité appartenant à un tiers", async () => {
      const owner = new User();
      owner.id = UUID_C;
      const activity = new Activity();
      activity.user = owner;
      mockRepository.findOne.mockResolvedValue(activity);

      await expect(service.remove(UUID_A, UUID_B)).rejects.toThrow(
        'Accès limité à vos propres données',
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('renvoie 404 pour une activité inexistante', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(UUID_A, UUID_C)).rejects.toThrow(
        `Activity #${UUID_A} not found`,
      );
    });
  });
});
