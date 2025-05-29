import { Test, TestingModule } from '@nestjs/testing';
import { ProgramLineService } from './program-line.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProgramLine } from './entities/program-line.entity';
import { Program } from '../program/entities/program.entity';
import { Exercise } from '../exercise/entities/exercise.entity';
import { Repository } from 'typeorm';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
});

describe('ProgramLineService', () => {
  let service: ProgramLineService;
  let programLineRepo: jest.Mocked<Repository<ProgramLine>>;
  let programRepo: jest.Mocked<Repository<Program>>;
  let exerciseRepo: jest.Mocked<Repository<Exercise>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramLineService,
        { provide: getRepositoryToken(ProgramLine), useFactory: mockRepo },
        { provide: getRepositoryToken(Program), useFactory: mockRepo },
        { provide: getRepositoryToken(Exercise), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<ProgramLineService>(ProgramLineService);
    programLineRepo = module.get(getRepositoryToken(ProgramLine));
    programRepo = module.get(getRepositoryToken(Program));
    exerciseRepo = module.get(getRepositoryToken(Exercise));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a program line', async () => {
  const dto = {
    programId: 1,
    exerciseId: 2,
    order: 1,
    repetitions: 10,
    duration: 30,
    calories: 50,
  };
  const program = { id: 1, title: 'prog' } as any;
  const exercise = { id: 2, title: 'ex', category: 'cat' } as any;
  const line = {
    id:1,
    program,
    exercise,
    order: dto.order,
    repetitions: dto.repetitions,
    duration: dto.duration,
    calories: dto.calories,
  };

  // Mocks pour les repositories
  programRepo.findOneBy.mockResolvedValue(program);
  exerciseRepo.findOneBy.mockResolvedValue(exercise);
  programLineRepo.create.mockReturnValue(line);
  programLineRepo.save.mockResolvedValue(line);

  const result = await service.create(dto as any);

  expect(programRepo.findOneBy).toHaveBeenCalledWith({ id: dto.programId });
  expect(exerciseRepo.findOneBy).toHaveBeenCalledWith({ id: dto.exerciseId });
  expect(programLineRepo.create).toHaveBeenCalledWith({
    program,
    exercise,
    order: dto.order,
    repetitions: dto.repetitions,
    duration: dto.duration,
    calories: dto.calories,
  });
  expect(programLineRepo.save).toHaveBeenCalledWith(line);
  expect(result).toBe(line);
});

  it('should throw if program not found', async () => {
    programRepo.findOneBy.mockResolvedValue(null);
    await expect(
      service.create({ programId: 1, exerciseId: 2 } as any)
    ).rejects.toThrow('Program #1 not found');
  });

  it('should throw if exercise not found', async () => {
    programRepo.findOneBy.mockResolvedValue({ id: 1 } as Program);
    exerciseRepo.findOneBy.mockResolvedValue(null);
    await expect(
      service.create({ programId: 1, exerciseId: 2 } as any)
    ).rejects.toThrow('Exercise #2 not found');
  });

  it('should find all program lines', async () => {
    const lines = [{ id: 1 }, { id: 2 }] as ProgramLine[];
    programLineRepo.find.mockResolvedValue(lines);
    const result = await service.findAll();
    expect(programLineRepo.find).toHaveBeenCalledWith({
      relations: ['program', 'exercise'],
    });
    expect(result).toBe(lines);
  });

  it('should find one program line', async () => {
    const line = {
      id: 1,
      order: 1,
      repetitions: 10,
      duration: 30,
      calories: 50,
      program: { id: 1, title: 'prog' },
      exercise: { id: 2, title: 'ex', category: 'cat' },
    } as any;
    programLineRepo.findOne.mockResolvedValue(line);

    const result = await service.findOne(1);
    expect(programLineRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['program', 'exercise'],
    });
    expect(result).toEqual({
      id: 1,
      order: 1,
      repetitions: 10,
      duration: 30,
      calories: 50,
      program: { id: 1, title: 'prog' },
      exercise: { id: 2, title: 'ex', category: 'cat' },
    });
  });

  it('should throw if program line not found', async () => {
    programLineRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(42)).rejects.toThrow('ProgramLine with id 42 not found');
  });
});