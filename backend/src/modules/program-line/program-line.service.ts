import { Injectable } from '@nestjs/common';
import { CreateProgramLineDto } from './dto/create-program-line.dto';
import { UpdateProgramLineDto } from './dto/update-program-line.dto';
import { Repository } from 'typeorm';
import { ProgramLine } from './entities/program-line.entity';
import { Program } from '../program/entities/program.entity';
import { Exercise } from '../exercise/entities/exercise.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProgramLineService {
   constructor(
    @InjectRepository(ProgramLine)
    private programLineRepository: Repository<ProgramLine>,
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
  ) {}

  async create(createProgramLineDto: CreateProgramLineDto) {
    // on récupère les entités liées
    const program  = await this.programRepository.findOneBy({ id: createProgramLineDto.programId });
    if (!program) throw new Error(`Program #${createProgramLineDto.programId} not found`);

    const exercise = await this.exerciseRepository.findOneBy({ id: createProgramLineDto.exerciseId });
    if (!exercise) throw new Error(`Exercise #${createProgramLineDto.exerciseId} not found`);

    const line = this.programLineRepository.create({
      program,
      exercise,
      order:       createProgramLineDto.order,
      repetitions: createProgramLineDto.repetitions,
      duration:    createProgramLineDto.duration,
      calories:    createProgramLineDto.calories,
    });

    return this.programLineRepository.save(line);
  }

  findAll() {
    return this.programLineRepository.find({
      relations: ['program', 'exercise'],
    });
  }

  findOne(id: number) {
    return this.programLineRepository.findOne({
       where: { id },
       relations: ['program', 'exercise'],
    }).then(line => {
      if (!line) {
        throw new Error(`ProgramLine with id ${id} not found`);
      }
  
      // Retourner les données 
      return {
        id:          line.id,
        order:       line.order,
        repetitions: line.repetitions,
        duration:    line.duration,
        calories:    line.calories,
        program: {
          id:    line.program.id,
          title: line.program.title,
        },
        exercise: {
          id:       line.exercise.id,
          title:    line.exercise.title,
          category: line.exercise.category,
        },
      };
    });;
  }

  update(id: number, updateProgramLineDto: UpdateProgramLineDto) {
    return `This action updates a #${id} programLine`;
  }

  remove(id: number) {
    return `This action removes a #${id} programLine`;
  }
}
