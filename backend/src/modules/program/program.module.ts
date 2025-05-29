import { forwardRef, Module } from '@nestjs/common';
import { ProgramService} from './program.service';
import { ProgramController } from './program.controller';
import { Program } from './entities/program.entity';
import { ExerciseModule } from '../exercise/exercise.module';
import { ProgramLineModule } from '../program-line/program-line.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Program]), 
    forwardRef(() => ExerciseModule),
    forwardRef(()=> ProgramLineModule),
  ],
  controllers: [ProgramController],
  providers: [ProgramService],
  exports: [ProgramService]
})
export class ProgramModule {}
