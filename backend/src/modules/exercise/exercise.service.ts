import { Injectable } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Repository } from 'typeorm';
import { Exercise } from './entities/exercise.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ExerciseService {
   constructor(
      @InjectRepository(Exercise)
      private exerciseRepository: Repository<Exercise>,
    ) {}
  

  create(createExerciseDto: CreateExerciseDto) {
    return this.exerciseRepository.save(createExerciseDto);
  }

  findAll() {
    return this.exerciseRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} exercise`;
  }

  update(id: number, updateExerciseDto: UpdateExerciseDto) {
    return `This action updates a #${id} exercise`;
  }

  remove(id: number) {
    return `This action removes a #${id} exercise`;
  }
}
