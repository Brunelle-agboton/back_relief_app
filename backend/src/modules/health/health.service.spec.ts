import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Health } from './entities/health.entity';
import { Repository } from 'typeorm';

const mockRepo = () => ({
  save: jest.fn(),
});

describe('HealthService', () => {
  let service: HealthService;
  let repo: jest.Mocked<Repository<Health>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: getRepositoryToken(Health), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    repo = module.get(getRepositoryToken(Health));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return pain options', () => {
    expect(service.getPainOptions()).toEqual(['Haut du dos', 'Milieu du dos', 'Bas du dos']);
  });

  it('should submit pain and save with recordedAt', async () => {
    const dto = { pain: 'Bas du dos', intensity: 5 };
    const saved = { ...dto, recordedAt: expect.any(Date) };
    repo.save.mockResolvedValue(saved as any);

    const result = await service.submitPain(dto as any);

    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({
      ...dto,
      recordedAt: expect.any(Date),
    }));
    expect(result).toBe(saved);
  });

  it('should return create string', () => {
    expect(service.create({} as any)).toBe('This action adds a new health');
  });

  it('should return all health string', () => {
    expect(service.findAll()).toBe('This action returns all health');
  });

  it('should return one health string', () => {
    expect(service.findOne(1)).toBe('This action returns a #1 health');
  });

  it('should return update string', () => {
    expect(service.update(1, {} as any)).toBe('This action updates a #1 health');
  });

  it('should return remove string', () => {
    expect(service.remove(1)).toBe('This action removes a #1 health');
  });
});