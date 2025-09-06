import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PainInputDto } from './dto/pain-input.dto';
import { User } from '../user/entities/user.entity';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthService;
  let userService: UserService;

  const mockHealthService = {
    getPainOptions: jest.fn(),
    submitPain: jest.fn(),
    getPainsLatest: jest.fn(),
    setHydratation: jest.fn(),
    latestHydratation: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthService, useValue: mockHealthService },
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: (context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { userId: 1 }; // Mock user
        return true;
      } })
      .compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthService>(HealthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPainOptions', () => {
    it('should return pain options', () => {
      const painOptions = ['Haut du dos', 'Bas du dos'];
      mockHealthService.getPainOptions.mockReturnValue(painOptions);
      expect(controller.getPainOptions()).toEqual(painOptions);
      expect(healthService.getPainOptions).toHaveBeenCalled();
    });
  });

  describe('submitPain', () => {
    it('should submit pain for a valid user', async () => {
      const req = { user: { userId: 1 } };
      const dto: PainInputDto = { painLocation: 'Bas du dos', painLevel: 5, painDescription: '', user: new User(), recordedAt: new Date() };
      const user = new User();
      mockUserService.findOne.mockResolvedValue(user);
      mockHealthService.submitPain.mockResolvedValue({ ...dto, user });

      const result = await controller.submitPain(req, dto);

      expect(userService.findOne).toHaveBeenCalledWith(1);
      expect(healthService.submitPain).toHaveBeenCalledWith({ ...dto, user });
      expect(result).toEqual({ ...dto, user });
    });

    it('should throw an error if user not found', async () => {
      const req = { user: { userId: 1 } };
      const dto: PainInputDto = { painLocation: 'Bas du dos', painLevel: 5, painDescription: '', user: new User(), recordedAt: new Date() };
      mockUserService.findOne.mockResolvedValue(null);
      await expect(controller.submitPain(req, dto)).rejects.toThrow('User not found');
    });
  });

  describe('getPainsLatest', () => {
    it('should get latest pains for a user', async () => {
        const req = { user: { userId: 1 } };
        const user = new User();
        mockUserService.findOne.mockResolvedValue(user);
        mockHealthService.getPainsLatest.mockResolvedValue([]);
        await controller.getPainsLatest(req);
        expect(healthService.getPainsLatest).toHaveBeenCalledWith(user);
    });

    it('should throw an error if user not found', async () => {
        const req = { user: { userId: 1 } };
        mockUserService.findOne.mockResolvedValue(null);
        await expect(controller.getPainsLatest(req)).rejects.toThrow('User not found');
    });
  });

  describe('setHydratation', () => {
    it('should set hydratation for a user', async () => {
        const req = { user: { userId: 1 } };
        const user = new User();
        const size = '500ml';
        mockUserService.findOne.mockResolvedValue(user);
        await controller.setHydratation(req, size);
        expect(healthService.setHydratation).toHaveBeenCalledWith(size);
    });

    it('should throw an error if user not found', async () => {
        const req = { user: { userId: 1 } };
        const size = '500ml';
        mockUserService.findOne.mockResolvedValue(null);
        await expect(controller.setHydratation(req, size)).rejects.toThrow('User not found');
    });
  });

  describe('latestHydratation', () => {
    it('should get latest hydratation for a user', async () => {
        const req = { user: { userId: 1 } };
        const user = new User();
        mockUserService.findOne.mockResolvedValue(user);
        await controller.latestHydratation(req);
        expect(healthService.latestHydratation).toHaveBeenCalledWith(user);
    });

    it('should throw an error if user not found', async () => {
        const req = { user: { userId: 1 } };
        mockUserService.findOne.mockResolvedValue(null);
        await expect(controller.latestHydratation(req)).rejects.toThrow('User not found');
    });
  });

  describe('findAll', () => {
    it('should return all health', () => {
      mockHealthService.findAll.mockReturnValue([]);
      expect(controller.findAll()).toEqual([]);
      expect(healthService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return one health', () => {
      mockHealthService.findOne.mockReturnValue({} as any);
      expect(controller.findOne('1')).toEqual({});
      expect(healthService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a health', () => {
      const dto: PainInputDto = { painLocation: 'Bas du dos', painLevel: 5, painDescription: '', user: new User(), recordedAt: new Date() };
      mockHealthService.update.mockReturnValue({} as any);
      expect(controller.update('1', dto)).toEqual({});
      expect(healthService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a health', () => {
      mockHealthService.remove.mockReturnValue(undefined);
      expect(controller.remove('1')).toBeUndefined();
      expect(healthService.remove).toHaveBeenCalledWith(1);
    });
  });
});
