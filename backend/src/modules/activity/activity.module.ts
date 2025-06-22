import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { Activity } from './entities/activity.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([Activity]), 
      forwardRef(() => UserModule), // Import UserModule to use UserService
    ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
