import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { UserModule } from '../user/user.module';
import { ProgramLine }        from '../program-line/entities/program-line.entity';
import { Health } from '../health/entities/health.entity';
import { Activity }                 from '../activity/entities/activity.entity';

@Module({
    imports: [
    TypeOrmModule.forFeature([Health, Activity, ProgramLine]),
      forwardRef(() => UserModule), // Import UserModule to use UserService
      ],
  controllers: [SummaryController],
  providers: [SummaryService],
  exports: [SummaryService],
})
export class SummaryModule {}
