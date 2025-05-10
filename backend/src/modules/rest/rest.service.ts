import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateRestDto } from './dto/create-rest.dto';
import { UpdateRestDto } from './dto/update-rest.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Rest } from './entities/rest.entity';

@Injectable()
export class RestService {
  constructor(
      @InjectRepository(Rest)
      private restRepository: Repository<Rest>,
    ) {}
  
  create(createRestDto: CreateRestDto) {

    return this.restRepository.save({
      ...createRestDto,
      recordedAt: new Date(),
    });
  }

  findAll() {
    return this.restRepository.find();
  }

  findOne(id: number) {

    return this.restRepository.findOne({
      where: { id },
    }).then(rest => {
      if (!rest) {
        throw new Error(`Rest with id ${id} not found`);
      }
  
      // Retourner les données dans le format demandé
      return {
        contentTitle: rest.contentTitle,
        position: rest.position,
        calories: rest.calories,
        steps: [
          {
            contentDescription: rest.contentDescription,
            image: rest.image,
            reps: 10, // Exemple de répétitions, vous pouvez ajuster selon vos besoins
           duration: rest.duration,
          },
        ],
        category: rest.category,
      };
    });
    } 

  update(id: number, updateRestDto: UpdateRestDto) {
    return `This action updates a #${id} rest`;
  }

  remove(id: number) {
    return `This action removes a #${id} rest`;
  }
}
