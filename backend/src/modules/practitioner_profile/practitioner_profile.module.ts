import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PractitionerProfile } from './entities/practitioner_profile.entity';
import { AvailabilityModule } from "../availability/availability.module";
import { PractitionerProfileService } from './practitioner_profile.service';
import { PractitionerProfileController } from './practitioner_profile.controller';
import { UserModule } from '../user/user.module';


@Module({
   imports: [
    TypeOrmModule.forFeature([ PractitionerProfile]), // Assuming 'PractitionerProfile' is the entity you want to use
    forwardRef(() => UserModule), // Import UserModule to use UserService
    forwardRef(() => AvailabilityModule), // Import AvailabilityModule
  ],
  controllers: [PractitionerProfileController],
  providers: [PractitionerProfileService],
  exports:[PractitionerProfileService],
})
export class PractitionerProfileModule {}
