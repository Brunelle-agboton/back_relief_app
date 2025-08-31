import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
  ) {}

  create(createAvailabilityDto: CreateAvailabilityDto): Promise<Availability> {
    const availability = this.availabilityRepository.create(createAvailabilityDto);
    return this.availabilityRepository.save(availability);
  }

  findAll(): Promise<Availability[]> {
    return this.availabilityRepository.find();
  }

  // We will add more methods here later (e.g., find by practitioner)
}
