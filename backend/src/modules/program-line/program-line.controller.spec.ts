import { Test, TestingModule } from '@nestjs/testing';
import { ProgramLineController } from './program-line.controller';
import { ProgramLineService } from './program-line.service';

describe('ProgramLineController', () => {
  let controller: ProgramLineController;
  let service: Partial<Record<keyof ProgramLineService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramLineController],
      providers: [{ provide: ProgramLineService, useValue: service }],
    }).compile();

    controller = module.get<ProgramLineController>(ProgramLineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a program line', () => {
    (service.create as jest.Mock).mockReturnValue('created');
    expect(controller.create({ order: 1 } as any)).toBe('created');
    expect(service.create).toHaveBeenCalledWith({ order: 1 });
  });

  it('should return all program lines', () => {
    (service.findAll as jest.Mock).mockReturnValue(['l1', 'l2']);
    expect(controller.findAll()).toEqual(['l1', 'l2']);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return one program line', () => {
    (service.findOne as jest.Mock).mockReturnValue('one');
    expect(controller.findOne('1')).toBe('one');
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a program line', () => {
    (service.update as jest.Mock).mockReturnValue('updated');
    expect(controller.update('1', { order: 2 } as any)).toBe('updated');
    expect(service.update).toHaveBeenCalledWith(1, { order: 2 });
  });

  it('should remove a program line', () => {
    (service.remove as jest.Mock).mockReturnValue('removed');
    expect(controller.remove('1')).toBe('removed');
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});