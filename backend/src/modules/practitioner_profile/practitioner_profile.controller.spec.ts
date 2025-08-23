import { Test, TestingModule } from '@nestjs/testing';
import { PractitionerProfileController } from './practitioner_profile.controller';
import { PractitionerProfileService } from './practitioner_profile.service';

describe('PractitionerProfileController', () => {
  let controller: PractitionerProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PractitionerProfileController],
      providers: [PractitionerProfileService],
    }).compile();

    controller = module.get<PractitionerProfileController>(PractitionerProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
