import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PractitionerProfile } from './entities/practitioner_profile.entity';
import { AvailabilityModule } from "../availability/availability.module";
import { PractitionerDiplomeModule } from "../practitioner_diplome/practitioner_diplome.module";

import { PractitionerProfileService } from './practitioner_profile.service';
import { PractitionerProfileController } from './practitioner_profile.controller';
import { UserModule } from '../user/user.module';
import { PractitionerDiplome } from '../practitioner_diplome/entities/practitioner_diplome.entity';


@Module({
   imports: [
    TypeOrmModule.forFeature([ PractitionerProfile, PractitionerDiplome]), // Assuming 'PractitionerProfile' is the entity you want to use
    forwardRef(() => UserModule), // Import UserModule to use UserService
    forwardRef(() => AvailabilityModule), // Import AvailabilityModule
    forwardRef(() => PractitionerDiplomeModule),
  ],
  controllers: [PractitionerProfileController],
  providers: [PractitionerProfileService],
  exports:[PractitionerProfileService],
})
export class PractitionerProfileModule {}
