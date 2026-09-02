import { Test, TestingModule } from '@nestjs/testing';
import { ProgramLineService } from './program-line.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProgramLine } from './entities/program-line.entity';
import { Program } from '../program/entities/program.entity';
import { Exercise } from '../exercise/entities/exercise.entity';
import { Repository } from 'typeorm';
import {
  UUID_A,
  UUID_B,
  UUID_C,
  UUID_D,
  UUID_E,
  UUID_MISSING,
} from '../../common/testing/uuid.fixtures';

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
      programId: UUID_A,
      exerciseId: UUID_B,
      order: 1,
      repetitions: 10,
      duration: 30,
      calories: 50,
    };
    const program = { id: UUID_A, title: 'prog' } as any;
    const exercise = { id: UUID_B, title: 'ex', category: 'cat' } as any;
    const line = {
      id: UUID_C,
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
      service.create({ programId: UUID_A, exerciseId: UUID_B } as any),
    ).rejects.toThrow(`Program #${UUID_A} not found`);
  });

  it('should throw if exercise not found', async () => {
    programRepo.findOneBy.mockResolvedValue({ id: UUID_A } as Program);
    exerciseRepo.findOneBy.mockResolvedValue(null);
    await expect(
      service.create({ programId: UUID_A, exerciseId: UUID_B } as any),
    ).rejects.toThrow(`Exercise #${UUID_B} not found`);
  });

  it('should find all program lines', async () => {
    const lines = [{ id: UUID_A }, { id: UUID_B }] as ProgramLine[];
    programLineRepo.find.mockResolvedValue(lines);
    const result = await service.findAll();
    expect(programLineRepo.find).toHaveBeenCalledWith({
      relations: ['program', 'exercise'],
    });
    expect(result).toBe(lines);
  });

  it('should find one program line', async () => {
    const line = {
      id: UUID_A,
      order: 1,
      repetitions: 10,
      duration: 30,
      calories: 50,
      program: { id: UUID_A, title: 'prog' },
      exercise: { id: UUID_B, title: 'ex', category: 'cat' },
    } as any;
    programLineRepo.findOne.mockResolvedValue(line);

    const result = await service.findOne(UUID_A);
    expect(programLineRepo.findOne).toHaveBeenCalledWith({
      where: { id: UUID_A },
      relations: ['program', 'exercise'],
    });
    expect(result).toEqual({
      id: UUID_A,
      order: 1,
      repetitions: 10,
      duration: 30,
      calories: 50,
      program: { id: UUID_A, title: 'prog' },
      exercise: { id: UUID_B, title: 'ex', category: 'cat' },
    });
  });

  it('should throw if program line not found', async () => {
    programLineRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(UUID_MISSING)).rejects.toThrow(
      `ProgramLine with id ${UUID_MISSING} not found`,
    );
  });

  it('should update a program line', async () => {
    const dto = {
      repetitions: 15,
      duration: 45,
    };
    const existingLine = {
      id: UUID_A,
      order: 1,
      repetitions: 10,
      duration: 30,
      calories: 50,
      program: { id: UUID_A, title: 'prog' },
      exercise: { id: UUID_B, title: 'ex', category: 'cat' },
    } as any;
    const updatedLine = { ...existingLine, ...dto };

    programLineRepo.findOneBy.mockResolvedValue(existingLine);
    programLineRepo.save.mockResolvedValue(updatedLine);

    const result = await service.update(UUID_A, dto as any);

    expect(programLineRepo.findOneBy).toHaveBeenCalledWith({ id: UUID_A });
    expect(programLineRepo.save).toHaveBeenCalledWith(updatedLine);
    expect(result).toBe(updatedLine);
  });

  it('should throw if program line to update not found', async () => {
    programLineRepo.findOneBy.mockResolvedValue(null);
    await expect(service.update(UUID_MISSING, {} as any)).rejects.toThrow(
      `ProgramLine with id ${UUID_MISSING} not found`,
    );
  });

  it('should throw if program not found during update', async () => {
    const dto = { programId: UUID_MISSING } as any;
    const existingLine = { id: UUID_A } as any;
    programLineRepo.findOneBy.mockResolvedValue(existingLine);
    programRepo.findOneBy.mockResolvedValue(null);

    await expect(service.update(UUID_A, dto)).rejects.toThrow(
      `Program #${UUID_MISSING} not found`,
    );
  });

  it('should throw if exercise not found during update', async () => {
    const dto = { exerciseId: UUID_MISSING } as any;
    const existingLine = { id: UUID_A } as any;
    programLineRepo.findOneBy.mockResolvedValue(existingLine);
    exerciseRepo.findOneBy.mockResolvedValue(null);

    await expect(service.update(UUID_A, dto)).rejects.toThrow(
      `Exercise #${UUID_MISSING} not found`,
    );
  });

  it('should update a program line with programId', async () => {
    const dto = { programId: UUID_B } as any;
    const existingLine = { id: UUID_A, program: { id: UUID_A } } as any;
    const newProgram = { id: UUID_B } as any;
    programLineRepo.findOneBy.mockResolvedValue(existingLine);
    programRepo.findOneBy.mockResolvedValue(newProgram);
    programLineRepo.save.mockResolvedValue({
      ...existingLine,
      program: newProgram,
    });

    const result = await service.update(UUID_A, dto);

    expect(programLineRepo.findOneBy).toHaveBeenCalledWith({ id: UUID_A });
    expect(programRepo.findOneBy).toHaveBeenCalledWith({ id: UUID_B });
    expect(programLineRepo.save).toHaveBeenCalledWith({
      ...existingLine,
      program: newProgram,
    });
    expect(result.program).toEqual(newProgram);
  });

  it('should update a program line with exerciseId', async () => {
    const dto = { exerciseId: UUID_C } as any;
    const existingLine = { id: UUID_A, exercise: { id: UUID_A } } as any;
    const newExercise = { id: UUID_C } as any;
    programLineRepo.findOneBy.mockResolvedValue(existingLine);
    exerciseRepo.findOneBy.mockResolvedValue(newExercise);
    programLineRepo.save.mockResolvedValue({
      ...existingLine,
      exercise: newExercise,
    });

    const result = await service.update(UUID_A, dto);

    expect(programLineRepo.findOneBy).toHaveBeenCalledWith({ id: UUID_A });
    expect(exerciseRepo.findOneBy).toHaveBeenCalledWith({ id: UUID_C });
    expect(programLineRepo.save).toHaveBeenCalledWith({
      ...existingLine,
      exercise: newExercise,
    });
    expect(result.exercise).toEqual(newExercise);
  });

  it('should remove a program line', async () => {
    programLineRepo.delete.mockResolvedValue({ affected: 1, raw: {} });
    const result = await service.remove(UUID_A);
    expect(programLineRepo.delete).toHaveBeenCalledWith(UUID_A);
    expect(result).toEqual({
      message: `ProgramLine with ID ${UUID_A} has been successfully removed`,
    });
  });

  it('should throw if program line to remove not found', async () => {
    programLineRepo.delete.mockResolvedValue({ affected: 0, raw: {} });
    await expect(service.remove(UUID_MISSING)).rejects.toThrow(
      `ProgramLine with ID ${UUID_MISSING} not found`,
    );
  });
});
