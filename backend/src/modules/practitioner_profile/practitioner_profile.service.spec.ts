import { Test, TestingModule } from '@nestjs/testing';
import { PractitionerProfileService } from './practitioner_profile.service';

describe('PractitionerProfileService', () => {
  let service: PractitionerProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PractitionerProfileService],
    }).compile();

    service = module.get<PractitionerProfileService>(PractitionerProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
