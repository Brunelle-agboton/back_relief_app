import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateHealthDto } from './dto/create-health.dto';
import { PainInputDto } from './dto/pain-input.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Health } from './entities/health.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(Health)
    private healthRepository: Repository<Health>,
  ) {}

  getPainOptions() {
    return ['Haut du dos', 'Milieu du dos', 'Bas du dos'];
  }

  submitPain(dto: PainInputDto) {

    return this.healthRepository.save({
      ...dto,
      recordedAt: new Date(),
    });
  }
  
  create(createHealthDto: CreateHealthDto) {
    return 'This action adds a new health';
  }

  findAll() {
    return `This action returns all health`;
  }

  findOne(id: number) {
    return `This action returns a #${id} health`;
  }

  update(id: number, updateHealthDto: PainInputDto) {
    // Update the health record with the new data
    return `This action updates a #${id} health`;
  }

  remove(id: number) {
    return `This action removes a #${id} health`;
  }
}
