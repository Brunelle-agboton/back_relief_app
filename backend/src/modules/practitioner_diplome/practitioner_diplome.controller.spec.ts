import { Test, TestingModule } from '@nestjs/testing';
import { PractitionerDiplomeController } from './practitioner_diplome.controller';
import { PractitionerDiplomeService } from './practitioner_diplome.service';

describe('PratitionerDiplomeController', () => {
  let controller: PractitionerDiplomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PractitionerDiplomeController],
      providers: [PractitionerDiplomeService],
    }).compile();

    controller = module.get<PractitionerDiplomeController>(PractitionerDiplomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
