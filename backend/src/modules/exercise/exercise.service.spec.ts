import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseService } from './exercise.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Exercise, Category, Position } from './entities/exercise.entity';
import { Repository } from 'typeorm';

const mockRepo = () => ({
  save: jest.fn(),
  find: jest.fn(),
});

describe('ExerciseService', () => {
  let service: ExerciseService;
  let repo: jest.Mocked<Repository<Exercise>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseService,
        { provide: getRepositoryToken(Exercise), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<ExerciseService>(ExerciseService);
    repo = module.get(getRepositoryToken(Exercise));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an exercise', async () => {
    const dto = {
      title: 'Squat au mur',
      category: Category.WALL,
      position: Position.LOMBAIRES,
      image: 'squat.jpg',
      description: 'Un exercice pour le dos',
    };
    const saved = { id: 1, ...dto };
    repo.save.mockResolvedValue(saved);

    const result = await service.create(dto as any);

    expect(repo.save).toHaveBeenCalledWith(dto);
    expect(result).toBe(saved);
  });

  it('should find all exercises', async () => {
    const exercises = [
      { id: 1, title: 'Squat', category: Category.WALL, position: Position.LOMBAIRES, image: 'squat.jpg' },
      { id: 2, title: 'Assis', category: Category.SIT, position: Position.BRAS, image: 'assis.jpg' },
    ];
    repo.find.mockResolvedValue(exercises);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalled();
    expect(result).toBe(exercises);
  });

  it('should return a string for findOne', () => {
    expect(service.findOne(1)).toBe('This action returns a #1 exercise');
  });

  it('should return a string for update', () => {
    expect(service.update(1, {} as any)).toBe('This action updates a #1 exercise');
  });

  it('should return a string for remove', () => {
    expect(service.remove(1)).toBe('This action removes a #1 exercise');
  });
});
