import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { UserService } from '../user/user.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: Partial<Record<keyof HealthService, jest.Mock>>;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;

  beforeEach(async () => {
    healthService = {
      getPainOptions: jest.fn(),
      submitPain: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    userService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthService, useValue: healthService },
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get pain options', () => {
    (healthService.getPainOptions as jest.Mock).mockReturnValue(['a', 'b']);
    expect(controller.getPainOptions()).toEqual(['a', 'b']);
    expect(healthService.getPainOptions).toHaveBeenCalled();
  });

  it('should submit pain for a valid user', async () => {
    const req = { user: { userId: 1 } };
    const dto = { pain: 'Bas du dos', intensity: 5 };
    const user = { id: 1, name: 'Test' };
    const saved = { ...dto, user };

    (userService.findOne as jest.Mock).mockResolvedValue(user);
    (healthService.submitPain as jest.Mock).mockResolvedValue(saved);

    const result = await controller.submitPain(req, dto as any);

    expect(userService.findOne).toHaveBeenCalledWith(1);
    expect(healthService.submitPain).toHaveBeenCalledWith({ ...dto, user });
    expect(result).toBe(saved);
  });

  it('should throw if user not found in submitPain', async () => {
    const req = { user: { userId: 1 } };
    const dto = { pain: 'Bas du dos', intensity: 5 };
    (userService.findOne as jest.Mock).mockResolvedValue(null);

    await expect(controller.submitPain(req, dto as any)).rejects.toThrow('User not found');
  });

  it('should return all health', () => {
    (healthService.findAll as jest.Mock).mockReturnValue(['h1', 'h2']);
    expect(controller.findAll()).toEqual(['h1', 'h2']);
    expect(healthService.findAll).toHaveBeenCalled();
  });

  it('should return one health', () => {
    (healthService.findOne as jest.Mock).mockReturnValue('one');
    expect(controller.findOne('1')).toBe('one');
    expect(healthService.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a health', () => {
    (healthService.update as jest.Mock).mockReturnValue('updated');
    expect(controller.update('1', { pain: 'Bas du dos' } as any)).toBe('updated');
    expect(healthService.update).toHaveBeenCalledWith(1, { pain: 'Bas du dos' });
  });

  it('should remove a health', () => {
    (healthService.remove as jest.Mock).mockReturnValue('removed');
    expect(controller.remove('1')).toBe('removed');
    expect(healthService.remove).toHaveBeenCalledWith(1);
  });
});