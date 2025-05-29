import { Test, TestingModule } from '@nestjs/testing';
import { ProgramService } from './program.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { Repository } from 'typeorm';

const mockRepo = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
});

describe('ProgramService', () => {
  let service: ProgramService;
  let repo: jest.Mocked<Repository<Program>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramService,
        { provide: getRepositoryToken(Program), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<ProgramService>(ProgramService);
    repo = module.get(getRepositoryToken(Program));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a program', async () => {
    const dto = { title: 'Test', description: 'desc', image: 'img.jpg' };
    const saved = { id: 1, ...dto, lines: [] };
    repo.save.mockResolvedValue(saved);

    const result = await service.create(dto as any);

    expect(repo.save).toHaveBeenCalledWith(dto);
    expect(result).toBe(saved);
  });

  it('should find all programs', async () => {
    const programs = [{ id: 1 }, { id: 2 }] as any[];
    repo.find.mockResolvedValue(programs);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledWith({
      relations: ['lines', 'lines.exercise'],
    });
    expect(result).toBe(programs);
  });

  it('should find one program and map lines', async () => {
    const program = {
      id: 1,
      title: 'Test',
      description: 'desc',
      image: 'img.jpg',
      lines: [
        {
          order: 2,
          repetitions: 5,
          duration: 30,
          calories: 10,
          exercise: {
            id: 1,
            title: 'ex',
            image: 'img',
            category: 'cat',
          },
        },
        {
          order: 1,
          repetitions: 3,
          duration: 20,
          calories: 5,
          exercise: {
            id: 2,
            title: 'ex2',
            image: 'img2',
            category: 'cat2',
          },
        },
      ],
    };
    repo.findOne.mockResolvedValue(program as any);

    const result = await service.findOne(1);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['lines', 'lines.exercise'],
    });
    // lines should be sorted by order
    expect(result.lines[0].order).toBe(1);
    expect(result.lines[1].order).toBe(2);
    expect(result.title).toBe(program.title);
    expect(result.description).toBe(program.description);
    expect(result.image).toBe(program.image);
  });

  it('should throw if program not found', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne(42)).rejects.toThrow('Program with id 42 not found');
  });

  it('should return update string', () => {
    expect(service.update(1, {} as any)).toBe('This action updates a #1 program');
  });

  it('should return remove string', () => {
    expect(service.remove(1)).toBe('This action removes a #1 program');
  });
});