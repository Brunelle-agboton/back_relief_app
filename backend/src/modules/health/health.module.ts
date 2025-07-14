import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthService } from './health.service';
import { UserModule } from '../user/user.module';
import { HealthController } from './health.controller';
import { Health } from './entities/health.entity'; // Adjust the import based on your entity location
import { Activity } from '../activity/entities/activity.entity';
import { Exercise }        from '../exercise/entities/exercise.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Health, Activity, Exercise]), // Assuming 'Health' is the entity you want to use
    forwardRef(() => UserModule), // Import UserModule to use UserService
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
