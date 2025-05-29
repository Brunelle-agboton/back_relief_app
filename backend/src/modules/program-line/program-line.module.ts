import { forwardRef, Module } from '@nestjs/common';
import { ProgramLineService } from './program-line.service';
import { ProgramLineController } from './program-line.controller';
import { ProgramLine } from './entities/program-line.entity';
import { ProgramModule } from '../program/program.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { Exercise } from '../exercise/entities/exercise.entity';
import { Program } from '../program/entities/program.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProgramLine, Program, Exercise]), 
    forwardRef(() => ProgramModule) ,
    forwardRef(() => ExerciseModule), 

  ],
  controllers: [ProgramLineController],
  providers: [ProgramLineService],
  exports: [ProgramLineService],
})
export class ProgramLineModule {}
