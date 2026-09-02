import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePractitionerProfileDto } from './dto/create-practitioner_profile.dto';
import { UpdatePractitionerProfileDto } from './dto/update-practitioner_profile.dto';
import { CompletePractitionerProfileDto } from './dto/complete-practitioner_profile.dto';
import {
  PractitionerProfile,
  EstablishmentType,
  ProfessionalType,
} from './entities/practitioner_profile.entity';
import { UserService } from '../user/user.service';
import { Availability } from '../availability/entities/availability.entity';
import { AddAvailabilityToPractitionerDto } from './dto/add-availability-to-practitioner.dto';
import { AvailabilityService } from '../availability/availability.service';
import { PractitionerDiplome } from '../practitioner_diplome/entities/practitioner_diplome.entity';

@Injectable()
export class PractitionerProfileService {
  constructor(
    @InjectRepository(PractitionerProfile)
    private practitionerProfileRepository: Repository<PractitionerProfile>,
    private readonly userService: UserService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async create(
    createPractitionerProfileDto: CreatePractitionerProfileDto,
  ): Promise<PractitionerProfile> {
    const {
      userId,
      availabilities: availabilitiesData,
      proSpecialities,
      ...profileData
    } = createPractitionerProfileDto;

    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    // Vérification de la valeur
    if (
      !Object.values(EstablishmentType).includes(profileData.establishmentType)
    ) {
      throw new BadRequestException(
        `Invalid establishmentType: ${profileData.establishmentType}`,
      );
    }
    // Vérification de la valeur
    if (
      !Object.values(ProfessionalType).includes(profileData.professionalType)
    ) {
      throw new BadRequestException(
        `Invalid professionalType: ${profileData.professionalType}`,
      );
    }
    // La normalisation JSON est désormais faite en amont par le DTO
    // (@ToJsonArray) : il ne reste qu'à gérer l'absence de valeur.
    const specialtiesArray: string[] = proSpecialities ?? [];

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

  async completePractionerProfile(
    id: string,
    completePractionerProfile: CompletePractitionerProfileDto,
  ): Promise<PractitionerProfile> {
    const {
      availabilities: availabilitiesData,
      proSpecialities,
      diplomes,
    } = completePractionerProfile;

    const practitioner = await this.practitionerProfileRepository.findOne({
      where: { id },
    });

    if (!practitioner) {
      throw new NotFoundException(`Practioner with ID ${id} not found`);
    }
    const specialtiesArray: string[] = proSpecialities ?? [];
    const diplomesArray = diplomes ?? [];

    const newDiplomes = diplomesArray.map((d) => {
      const newDiplome = new PractitionerDiplome();
      newDiplome.diplome = d.diplome;
      newDiplome.school = d.school;
      newDiplome.country = d.country;
      newDiplome.year = d.yearExperience ?? d.year ?? 0;
      newDiplome.practitionerProfile = practitioner;
      return newDiplome;
    });

    practitioner.diplomes = newDiplomes;
    practitioner.specialties = specialtiesArray;

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
        availability.practitionerProfile = practitioner;
        availability.timezone = 'Canada/Québec';
        availabilities.push(availability);
      }
    }

    practitioner.availabilities = availabilities;

    return this.practitionerProfileRepository.save(practitioner);
  }
  findAll() {
    return this.practitionerProfileRepository.find({
      relations: [
        'user',
        'availabilities',
        'appointments',
        'appointments.patient',
        'appointments.practitionerProfile',
      ],
    });
  }

  findOne(id: string) {
    return this.practitionerProfileRepository.findOne({
      where: { id },
      relations: [
        'user',
        'availabilities',
        'appointments',
        'appointments.patient',
        'appointments.practitionerProfile',
      ],
    });
  }

  async findForUser(userId: string): Promise<PractitionerProfile> {
    const profile = await this.practitionerProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: [
        'user',
        'availabilities',
        'appointments',
        'appointments.patient',
        'appointments.practitionerProfile',
      ],
    });

    if (!profile) {
      throw new NotFoundException(
        `Practitioner profile for user with ID ${userId} not found`,
      );
    }

    return profile;
  }

  async findByEmail(email: string): Promise<PractitionerProfile> {
    const profile = await this.practitionerProfileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect(
        'profile.availabilities',
        'availability',
        'availability.isBooked = :isBooked',
        { isBooked: false },
      )
      .where('user.email = :email', { email })
      .getOne();

    if (!profile) {
      throw new NotFoundException(
        `Practitioner profile for user with email ${email} not found`,
      );
    }

    return profile;
  }

  /**
   * SEC-07 : le profil ciblé n'est plus celui indiqué dans le corps de requête
   * (`userId`, qui permettait de créer des créneaux pour n'importe quel
   * praticien) mais celui de l'appelant, résolu par le contrôleur.
   */
  async addAvailability(
    profileId: string,
    addAvailabilityDto: AddAvailabilityToPractitionerDto,
  ): Promise<Availability> {
    const profile = await this.practitionerProfileRepository.findOne({
      where: { id: profileId },
      relations: ['availabilities'], // Load existing availabilities to check for duplicates
    });

    if (!profile) {
      throw new NotFoundException(
        `Practitioner profile ${profileId} not found`,
      );
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
    const isDuplicate = profile.availabilities.some(
      (slot) =>
        new Date(slot.startTime).getTime() === newStartTime.getTime() &&
        new Date(slot.endTime).getTime() === newEndTime.getTime(),
    );

    if (isDuplicate) {
      throw new BadRequestException('This availability slot already exists.');
    }

    const newAvailability = new Availability();
    newAvailability.startTime = newStartTime;
    newAvailability.endTime = newEndTime;
    newAvailability.timezone = addAvailabilityDto.timezone;
    newAvailability.note = addAvailabilityDto.note ?? '';
    newAvailability.practitionerProfile = profile; // Link to the profile

    return this.availabilityService.create(newAvailability); // Use the AvailabilityService to save
  }

  async update(
    id: string,
    updatePractitionerProfileDto: UpdatePractitionerProfileDto,
  ): Promise<PractitionerProfile> {
    const profile = await this.practitionerProfileRepository.findOne({
      where: { id },
    });
    if (!profile) {
      throw new NotFoundException(
        `PractitionerProfile with ID ${id} not found`,
      );
    }

    Object.assign(profile, updatePractitionerProfileDto);

    return this.practitionerProfileRepository.save(profile);
  }

  /**
   * SEC-07 : vérifie qu'un profil praticien appartient bien à l'appelant avant
   * toute lecture ou écriture ciblée par `:id`.
   */
  async assertOwnedBy(
    profileId: string,
    userId: string,
  ): Promise<PractitionerProfile> {
    const profile = await this.practitionerProfileRepository.findOne({
      where: { id: profileId },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException(
        `PractitionerProfile with ID ${profileId} not found`,
      );
    }
    if (profile.user?.id !== userId) {
      throw new ForbiddenException(
        'Accès limité à votre propre profil praticien',
      );
    }
    return profile;
  }

  /**
   * SEC-04 : projection publique utilisée par le parcours d'inscription
   * praticien (l'appelant n'est pas encore authentifié). Ne renvoie ni
   * l'e-mail, ni l'identifiant, ni aucune donnée du compte utilisateur.
   */
  async findPublicByEmail(email: string) {
    const profile = await this.findByEmail(email);

    return {
      id: profile.id,
      practitionerName: profile.user?.userName ?? null,
      professionalType: profile.professionalType,
      specialties: profile.specialties ?? [],
      city: profile.city ?? null,
      country: profile.country ?? null,
      timezone: profile.timezone,
      availabilities: (profile.availabilities ?? []).map((slot) => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timezone: slot.timezone,
      })),
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.practitionerProfileRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `PractitionerProfile with ID ${id} not found`,
      );
    }
    return {
      message: `PractitionerProfile with ID ${id} has been successfully removed`,
    };
  }
}
