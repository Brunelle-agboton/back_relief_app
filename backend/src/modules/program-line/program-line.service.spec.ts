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
  delete: jest.fn(),
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

  it('should update a program line', async () => {
    const dto = {
      repetitions: 15,
      duration: 45,
    };
    const existingLine = {
      id: 1,
      order: 1,
      repetitions: 10,
      duration: 30,
      calories: 50,
      program: { id: 1, title: 'prog' },
      exercise: { id: 2, title: 'ex', category: 'cat' },
    } as any;
    const updatedLine = { ...existingLine, ...dto };

    programLineRepo.findOneBy.mockResolvedValue(existingLine);
    programLineRepo.save.mockResolvedValue(updatedLine);

    const result = await service.update(1, dto as any);

    expect(programLineRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(programLineRepo.save).toHaveBeenCalledWith(updatedLine);
    expect(result).toBe(updatedLine);
  });

  it('should throw if program line to update not found', async () => {
    programLineRepo.findOneBy.mockResolvedValue(null);
    await expect(service.update(42, {} as any)).rejects.toThrow('ProgramLine with id 42 not found');
  });

  it('should throw if program not found during update', async () => {
    const dto = { programId: 99 } as any;
    const existingLine = { id: 1 } as any;
    programLineRepo.findOneBy.mockResolvedValue(existingLine);
    programRepo.findOneBy.mockResolvedValue(null);

    await expect(service.update(1, dto)).rejects.toThrow('Program #99 not found');
  });

  it('should throw if exercise not found during update', async () => {
    const dto = { exerciseId: 99 } as any;
    const existingLine = { id: 1 } as any;
    programLineRepo.findOneBy.mockResolvedValue(existingLine);
    exerciseRepo.findOneBy.mockResolvedValue(null);

    await expect(service.update(1, dto)).rejects.toThrow('Exercise #99 not found');
  });

  it('should update a program line with programId', async () => {
    const dto = { programId: 2 } as any;
    const existingLine = { id: 1, program: { id: 1 } } as any;
    const newProgram = { id: 2 } as any;
    programLineRepo.findOneBy.mockResolvedValue(existingLine);
    programRepo.findOneBy.mockResolvedValue(newProgram);
    programLineRepo.save.mockResolvedValue({ ...existingLine, program: newProgram });

    const result = await service.update(1, dto);

    expect(programLineRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(programRepo.findOneBy).toHaveBeenCalledWith({ id: 2 });
    expect(programLineRepo.save).toHaveBeenCalledWith({ ...existingLine, program: newProgram });
    expect(result.program).toEqual(newProgram);
  });

  it('should update a program line with exerciseId', async () => {
    const dto = { exerciseId: 3 } as any;
    const existingLine = { id: 1, exercise: { id: 1 } } as any;
    const newExercise = { id: 3 } as any;
    programLineRepo.findOneBy.mockResolvedValue(existingLine);
    exerciseRepo.findOneBy.mockResolvedValue(newExercise);
    programLineRepo.save.mockResolvedValue({ ...existingLine, exercise: newExercise });

    const result = await service.update(1, dto);

    expect(programLineRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(exerciseRepo.findOneBy).toHaveBeenCalledWith({ id: 3 });
    expect(programLineRepo.save).toHaveBeenCalledWith({ ...existingLine, exercise: newExercise });
    expect(result.exercise).toEqual(newExercise);
  });

  it('should remove a program line', async () => {
    programLineRepo.delete.mockResolvedValue({ affected: 1, raw: {} });
    const result = await service.remove(1);
    expect(programLineRepo.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: 'ProgramLine with ID 1 has been successfully removed' });
  });

  it('should throw if program line to remove not found', async () => {
    programLineRepo.delete.mockResolvedValue({ affected: 0, raw: {} });
    await expect(service.remove(42)).rejects.toThrow('ProgramLine with ID 42 not found');
  });
});