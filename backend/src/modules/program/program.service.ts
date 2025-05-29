import { Injectable } from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
  ) {}

  create(createProgramDto: CreateProgramDto) {
    return this.programRepository.save(createProgramDto);
  }

  findAll() {
    return this.programRepository.find({
    relations: ['lines', 'lines.exercise'],
  });
  }

  findOne(id: number) {
    return this.programRepository.findOne({
      where: { id },
      relations: ['lines', 'lines.exercise'], 
    }).then(program => {
      if (!program) {
        throw new Error(`Program with id ${id} not found`);
      }
  
      // Retourner les données 
      return {
         id:          program.id,
        title:       program.title,
        description: program.description,
        image:       program.image,
        lines: program.lines
          .sort((a, b) => a.order - b.order)
          .map(line => ({
            order:       line.order,
            repetitions: line.repetitions,
            duration:    line.duration,
            calories:    line.calories,
            exercise: {
              id:       line.exercise.id,
              title:    line.exercise.title,
              image:    line.exercise.image,
              category: line.exercise.category,
            },
        })),
      };
    });
    } 

  update(id: number, updateProgramDto: UpdateProgramDto) {
    return `This action updates a #${id} program`;
  }

  remove(id: number) {
    return `This action removes a #${id} program`;
  }
}
