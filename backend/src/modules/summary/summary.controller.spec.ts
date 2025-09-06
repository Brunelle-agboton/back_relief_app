import { Test, TestingModule } from '@nestjs/testing';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { User } from '../user/entities/user.entity';

describe('SummaryController', () => {
  let controller: SummaryController;
  let summaryService: SummaryService;
  let userService: UserService;

  const mockSummaryService = {
    getSummaryForUser: jest.fn(),
    getUserHealth: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummaryController],
      providers: [
        {
          provide: SummaryService,
          useValue: mockSummaryService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<SummaryController>(SummaryController);
    summaryService = module.get<SummaryService>(SummaryService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return a summary for the user', async () => {
      const userId = 1;
      const user = new User();
      user.id = userId;
      const summary = { healthHistory: [], exercises: [], notifications: [] };
      const req = { user: { userId } };

      mockUserService.findOne.mockResolvedValue(user);
      mockSummaryService.getSummaryForUser.mockResolvedValue(summary);

      const result = await controller.getSummary(req);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(summaryService.getSummaryForUser).toHaveBeenCalledWith(user);
      expect(result).toEqual(summary);
    });

    it('should throw an error if user is not found', async () => {
        const userId = 1;
        const req = { user: { userId } };
  
        mockUserService.findOne.mockResolvedValue(null);
  
        await expect(controller.getSummary(req)).rejects.toThrow('User not found');
      });
  });

  describe('getUserHealthDetails', () => {
    it('should return health details for the user', async () => {
      const userId = 1;
      const user = new User();
      user.id = userId;
      const healthDetails = { painLevel: 5, nbExercises: 10, streakDays: 3 };
      const req = { user: { userId } };

      mockUserService.findOne.mockResolvedValue(user);
      mockSummaryService.getUserHealth.mockResolvedValue(healthDetails);

      const result = await controller.getUserHealthDetails(req);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(summaryService.getUserHealth).toHaveBeenCalledWith(user);
      expect(result).toEqual(healthDetails);
    });

    it('should throw an error if user is not found', async () => {
        const userId = 1;
        const req = { user: { userId } };
  
        mockUserService.findOne.mockResolvedValue(null);
  
        await expect(controller.getUserHealthDetails(req)).rejects.toThrow('User not found');
      });
  });
});
