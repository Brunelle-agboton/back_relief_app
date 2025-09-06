import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { UserService } from '../user/user.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { User } from '../user/entities/user.entity';
import { Activity } from './entities/activity.entity';
import { JwtAuthGuard } from '../auth/jwt.guard';

describe('ActivityController', () => {
  let controller: ActivityController;
  let activityService: ActivityService;
  let userService: UserService;

  const mockActivityService = {
    log: jest.fn(),
    findByUser: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        { provide: ActivityService, useValue: mockActivityService },
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ActivityController>(ActivityController);
    activityService = module.get<ActivityService>(ActivityService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('logAction', () => {
    it('should log an activity', async () => {
      const userId = 1;
      const user = new User();
      user.id = userId;
      const createActivityDto: CreateActivityDto = {
        type: 'test' as any,
        metadata: '{}',
        user: user,
      };
      const activity = new Activity();
      const req = { user: { userId } };

      mockUserService.findOne.mockResolvedValue(user);
      mockActivityService.log.mockResolvedValue(activity);

      const result = await controller.logAction(req, createActivityDto);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(activityService.log).toHaveBeenCalledWith({ ...createActivityDto, user });
      expect(result).toEqual(activity);
    });

    it('should throw an error if user is not found', async () => {
      const userId = 1;
      const createActivityDto: CreateActivityDto = {
        type: 'test' as any,
        metadata: '{}',
        user: new User(),
      };
      const req = { user: { userId } };

      mockUserService.findOne.mockResolvedValue(null);

      await expect(controller.logAction(req, createActivityDto)).rejects.toThrow('User not found');
    });
  });

  describe('getForUser', () => {
    it('should return activities for a user', async () => {
      const userId = 1;
      const activities = [new Activity()];
      const req = { user: { userId } };

      mockActivityService.findByUser.mockResolvedValue(activities);

      const result = await controller.getForUser(String(userId), req);

      expect(activityService.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(activities);
    });
  });

  describe('findAll', () => {
    it('should return all activities', async () => {
      const activities = [new Activity()];
      mockActivityService.findAll.mockResolvedValue(activities);

      const result = await controller.findAll();

      expect(activityService.findAll).toHaveBeenCalled();
      expect(result).toEqual(activities);
    });
  });

  describe('update', () => {
    it('should update an activity', async () => {
      const id = '1';
      const updateActivityDto: UpdateActivityDto = {};
      const activity = new Activity();
      mockActivityService.update.mockResolvedValue(activity);

      const result = await controller.update(id, updateActivityDto);

      expect(activityService.update).toHaveBeenCalledWith(+id, updateActivityDto);
      expect(result).toEqual(activity);
    });
  });

  describe('remove', () => {
    it('should remove an activity', async () => {
      const id = '1';
      mockActivityService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(activityService.remove).toHaveBeenCalledWith(+id);
    });
  });
});