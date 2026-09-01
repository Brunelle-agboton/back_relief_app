import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { UserService } from '../user/user.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { User } from '../user/entities/user.entity';
import { Activity } from './entities/activity.entity';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { UserRole } from '../../common/enums/user-role.enum';
import { ForbiddenException } from '@nestjs/common';

const asUser = (userId: number, role: UserRole = UserRole.USER) =>
  ({ user: { userId, email: 'a@a.com', role } }) as AuthenticatedRequest;

describe('ActivityController', () => {
  let controller: ActivityController;
  let activityService: ActivityService;
  let userService: UserService;

  const mockActivityService = {
    log: jest.fn(),
    findByUser: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
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
      };
      const activity = new Activity();

      mockUserService.findOne.mockResolvedValue(user);
      mockActivityService.log.mockResolvedValue(activity);

      const result = await controller.logAction(
        asUser(userId),
        createActivityDto,
      );

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      // SEC-05 : l'utilisateur vient du jeton, pas du corps de requête.
      expect(activityService.log).toHaveBeenCalledWith(createActivityDto, user);
      expect(result).toEqual(activity);
    });

    it("propage l'erreur si l'utilisateur du jeton n'existe plus", async () => {
      const createActivityDto: CreateActivityDto = {
        type: 'test' as any,
        metadata: '{}',
      };

      mockUserService.findOne.mockRejectedValue(
        new Error('User with id 1 not found'),
      );

      await expect(
        controller.logAction(asUser(1), createActivityDto),
      ).rejects.toThrow('User with id 1 not found');
    });
  });

  describe('getForUser', () => {
    it('should return activities for a user', async () => {
      const userId = 1;
      const activities = [new Activity()];

      mockActivityService.findByUser.mockResolvedValue(activities);

      const result = await controller.getForUser(userId, asUser(userId));

      expect(activityService.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(activities);
    });

    // SEC-04/07 : findByUser ignorait req.user.
    it("refuse l'historique d'un autre utilisateur", () => {
      expect(() => controller.getForUser(2, asUser(1))).toThrow(
        ForbiddenException,
      );
      expect(activityService.findByUser).not.toHaveBeenCalled();
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

  describe('remove', () => {
    it("transmet l'appelant au service pour le contrôle de propriété", async () => {
      mockActivityService.remove.mockResolvedValue(undefined);

      await controller.remove(1, asUser(3));

      expect(activityService.remove).toHaveBeenCalledWith(1, 3, false);
    });
  });
});
