import { Test, TestingModule } from '@nestjs/testing';
import { PainService } from './activity.service';

describe('PainService', () => {
  let service: PainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PainService],
    }).compile();

    service = module.get<PainService>(PainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
