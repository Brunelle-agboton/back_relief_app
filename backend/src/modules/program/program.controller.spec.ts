import { Test, TestingModule } from '@nestjs/testing';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';

describe('ProgramController', () => {
  let controller: ProgramController;
  let service: Partial<Record<keyof ProgramService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramController],
      providers: [{ provide: ProgramService, useValue: service }],
    }).compile();

    controller = module.get<ProgramController>(ProgramController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a program', () => {
    (service.create as jest.Mock).mockReturnValue('created');
    expect(controller.create({ title: 'Test' } as any)).toBe('created');
    expect(service.create).toHaveBeenCalledWith({ title: 'Test' });
  });

  it('should return all programs', () => {
    (service.findAll as jest.Mock).mockReturnValue(['p1', 'p2']);
    expect(controller.findAll()).toEqual(['p1', 'p2']);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return one program', () => {
    (service.findOne as jest.Mock).mockReturnValue('one');
    expect(controller.findOne('1')).toBe('one');
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a program', () => {
    (service.update as jest.Mock).mockReturnValue('updated');
    expect(controller.update('1', { title: 'new' } as any)).toBe('updated');
    expect(service.update).toHaveBeenCalledWith(1, { title: 'new' });
  });

  it('should remove a program', () => {
    (service.remove as jest.Mock).mockReturnValue('removed');
    expect(controller.remove('1')).toBe('removed');
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});