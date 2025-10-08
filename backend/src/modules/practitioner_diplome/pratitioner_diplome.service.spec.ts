import { Test, TestingModule } from '@nestjs/testing';
import { PractitionerDiplomeService } from './practitioner_diplome.service';

describe('PratitionerDiplomeService', () => {
  let service: PractitionerDiplomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PractitionerDiplomeService],
    }).compile();

    service = module.get<PractitionerDiplomeService>(PractitionerDiplomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
