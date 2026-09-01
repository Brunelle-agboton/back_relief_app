import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PainInputDto } from './dto/pain-input.dto';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';

const asUser = (userId: number) =>
  ({
    user: { userId, email: 'a@a.com', role: UserRole.USER },
  }) as AuthenticatedRequest;

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
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthService, useValue: mockHealthService },
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { userId: 1, email: 'a@a.com', role: UserRole.USER };
          return true;
        },
      })
      .compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthService>(HealthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * SEC-04 : les routes de scaffolding GET/PATCH/DELETE /health/:id et
   * GET /health ont été supprimées ; elles étaient publiques et entraient en
   * conflit avec la sonde de disponibilité.
   */
  it("n'expose plus les routes CRUD de scaffolding", () => {
    expect((controller as any).findAll).toBeUndefined();
    expect((controller as any).findOne).toBeUndefined();
    expect((controller as any).update).toBeUndefined();
    expect((controller as any).remove).toBeUndefined();
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
    const dto: PainInputDto = {
      painLocation: 'Bas du dos',
      painLevel: 5,
      painDescription: '',
    };

    it("rattache le relevé à l'utilisateur du jeton", async () => {
      const user = new User();
      mockUserService.findOne.mockResolvedValue(user);
      mockHealthService.submitPain.mockResolvedValue({ ...dto, user });

      const result = await controller.submitPain(asUser(1), dto);

      expect(userService.findOne).toHaveBeenCalledWith(1);
      expect(healthService.submitPain).toHaveBeenCalledWith(dto, user);
      expect(result).toEqual({ ...dto, user });
    });

    it("propage l'erreur si le compte du jeton n'existe plus", async () => {
      mockUserService.findOne.mockRejectedValue(
        new NotFoundException('User with id 1 not found'),
      );
      await expect(controller.submitPain(asUser(1), dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPainsLatest', () => {
    it('should get latest pains for a user', async () => {
      const user = new User();
      mockUserService.findOne.mockResolvedValue(user);
      mockHealthService.getPainsLatest.mockResolvedValue([]);
      await controller.getPainsLatest(asUser(1));
      expect(healthService.getPainsLatest).toHaveBeenCalledWith(user);
    });
  });

  describe('setHydratation', () => {
    it("rattache le relevé d'hydratation à l'utilisateur du jeton", async () => {
      const user = new User();
      mockUserService.findOne.mockResolvedValue(user);
      await controller.setHydratation(asUser(1), { size: '500ml' });
      expect(healthService.setHydratation).toHaveBeenCalledWith('500ml', user);
    });
  });

  describe('latestHydratation', () => {
    it('should get latest hydratation for a user', async () => {
      const user = new User();
      mockUserService.findOne.mockResolvedValue(user);
      await controller.latestHydratation(asUser(1));
      expect(healthService.latestHydratation).toHaveBeenCalledWith(user);
    });
  });
});
