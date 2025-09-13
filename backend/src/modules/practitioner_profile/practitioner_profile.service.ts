import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePractitionerProfileDto } from './dto/create-practitioner_profile.dto';
import { UpdatePractitionerProfileDto } from './dto/update-practitioner_profile.dto';
import { PractitionerProfile, EstablishmentType } from './entities/practitioner_profile.entity';
import { UserService } from '../user/user.service';
import { Availability } from '../availability/entities/availability.entity';
import { AddAvailabilityToPractitionerDto } from './dto/add-availability-to-practitioner.dto';
import { AvailabilityService } from '../availability/availability.service';

@Injectable()
export class PractitionerProfileService {
  constructor(
    @InjectRepository(PractitionerProfile)
    private practitionerProfileRepository: Repository<PractitionerProfile>,
    private readonly userService: UserService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async create(createPractitionerProfileDto: CreatePractitionerProfileDto): Promise<PractitionerProfile> {
    const { userId, availabilities: availabilitiesData, proSpecialities, ...profileData } = createPractitionerProfileDto;

    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
 // Vérification de la valeur
  if (!Object.values(EstablishmentType).includes(profileData.establishmentType)) {
    throw new BadRequestException(`Invalid establishmentType: ${profileData.establishmentType}`);
  }
    let specialtiesArray: string[];
    if (typeof proSpecialities === 'string') {
      try {
        specialtiesArray = JSON.parse(proSpecialities as any);
      } catch (e) {
        throw new BadRequestException('proSpecialities must be a valid JSON array string');
      }
    } else {
      specialtiesArray = proSpecialities;
    } 
    
    const profile = this.practitionerProfileRepository.create({
      ...profileData,
      user: user,
      specialties: specialtiesArray,
    });

    const availabilities: Availability[] = [];
    for (const date in availabilitiesData) {
      for (const time of availabilitiesData[date]) {
        const availability = new Availability();
        const [hour, minute] = time.split(':').map(Number);
        const startTime = new Date(date);
        startTime.setHours(hour, minute);

        const endTime = new Date(startTime.getTime() + 30 * 60000); // Add 30 minutes

        availability.startTime = startTime;
        availability.endTime = endTime;
        availability.practitionerProfile = profile;
        availability.timezone = 'Canada/Québec'; 
        availabilities.push(availability);
      }
    }

    profile.availabilities = availabilities;

    return this.practitionerProfileRepository.save(profile);
  }

  findAll() {
    return this.practitionerProfileRepository.find({ relations: ['user', 'availabilities'] });
  }

  findOne(id: number) {
    return this.practitionerProfileRepository.findOne({ where: { id }, relations: ['user', 'availabilities'] });
  }

  async findForUser(userId: number): Promise<PractitionerProfile> {
    const profile = await this.practitionerProfileRepository.findOne({
      where: { user: { id: userId} },
      relations: ['user', 'availabilities'],
    });

    if (!profile) {
      throw new NotFoundException(`Practitioner profile for user with ID ${userId} not found`);
    }

    return profile;
  }

  async addAvailability(addAvailabilityDto: AddAvailabilityToPractitionerDto): Promise<Availability> {
    const profile = await this.practitionerProfileRepository.findOne({
      where:  { id: addAvailabilityDto.userId },
      relations: ['availabilities'], // Load existing availabilities to check for duplicates
    });

    if (!profile) {
      throw new NotFoundException(`Practitioner profile for user with ID ${addAvailabilityDto.userId} not found`);
    }

    const newStartTime = new Date(addAvailabilityDto.startTime);
    const newEndTime = new Date(addAvailabilityDto.endTime);

    // Basic validation: ensure start time is before end time and in the future
    if (newStartTime >= newEndTime) {
      throw new BadRequestException('Start time must be before end time.');
    }
    if (newStartTime < new Date()) {
        throw new BadRequestException('Cannot add availability in the past.');
    }

    // Check for duplicates
    const isDuplicate = profile.availabilities.some(slot =>
      new Date(slot.startTime).getTime() === newStartTime.getTime() &&
      new Date(slot.endTime).getTime() === newEndTime.getTime()
    );

    if (isDuplicate) {
      throw new BadRequestException('This availability slot already exists.');
    }

    const newAvailability = new Availability();
    newAvailability.startTime = newStartTime;
    newAvailability.endTime = newEndTime;
    newAvailability.timezone = addAvailabilityDto.timezone;
    newAvailability.note = addAvailabilityDto.note ?? "";
    newAvailability.practitionerProfile = profile; // Link to the profile

    return this.availabilityService.create(newAvailability); // Use the AvailabilityService to save
  }

  update(id: number, updatePractitionerProfileDto: UpdatePractitionerProfileDto) {
    return `This action updates a #${id} practitionerProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} practitionerProfile`;
  }
}