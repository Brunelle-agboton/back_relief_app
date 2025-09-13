import { Injectable,BadRequestException } from '@nestjs/common';
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

  async findExactSlot(practitionerProfileId: number, startTime: Date, endTime: Date): Promise<Availability | null> {
    return this.availabilityRepository.findOne({
      where: {
        practitionerProfile: { id: practitionerProfileId },
        startTime: startTime,
        endTime: endTime,
        isBooked: false, // Only find unbooked slots
      },
    });
  }

  async update(id: number, availability: Availability): Promise<Availability> {
    // Ensure the ID matches the entity's ID
    if (id !== availability.id) {
      throw new BadRequestException('ID in path does not match entity ID.');
    }
    return this.availabilityRepository.save(availability);
  }

  // We will add more methods here later (e.g., find by practitioner)
}
