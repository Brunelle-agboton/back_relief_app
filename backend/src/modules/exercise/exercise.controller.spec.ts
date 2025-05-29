import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { Category, Position } from './entities/exercise.entity';

describe('ExerciseController', () => {
  let controller: ExerciseController;
  let service: Partial<Record<keyof ExerciseService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseController],
      providers: [{ provide: ExerciseService, useValue: service }],
    }).compile();

    controller = module.get<ExerciseController>(ExerciseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an exercise', () => {
    const dto = {
      title: 'Squat au mur',
      category: Category.WALL,
      position: Position.LOMBAIRES,
      image: 'squat.jpg',
      description: 'Un exercice pour le dos',
    };
    (service.create as jest.Mock).mockReturnValue('created');
    expect(controller.create(dto as any)).toBe('created');
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all exercises', () => {
    (service.findAll as jest.Mock).mockReturnValue(['ex1', 'ex2']);
    expect(controller.findAll()).toEqual(['ex1', 'ex2']);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return one exercise', () => {
    (service.findOne as jest.Mock).mockReturnValue('one');
    expect(controller.findOne('1')).toBe('one');
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update an exercise', () => {
    (service.update as jest.Mock).mockReturnValue('updated');
    expect(controller.update('1', { title: 'new' } as any)).toBe('updated');
    expect(service.update).toHaveBeenCalledWith(1, { title: 'new' });
  });

  it('should remove an exercise', () => {
    (service.remove as jest.Mock).mockReturnValue('removed');
    expect(controller.remove('1')).toBe('removed');
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});