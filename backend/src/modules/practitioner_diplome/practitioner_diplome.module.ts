import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PractitionerDiplomeService } from './practitioner_diplome.service';
import { PractitionerDiplomeController } from './practitioner_diplome.controller';
import { PractitionerDiplome } from './entities/practitioner_diplome.entity';
import { PractitionerProfileModule } from '../practitioner_profile/practitioner_profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PractitionerDiplome]),
    forwardRef(() => PractitionerProfileModule),
  ],
  controllers: [PractitionerDiplomeController],
  providers: [PractitionerDiplomeService],
  exports: [PractitionerDiplomeService],
})
export class PractitionerDiplomeModule {}
