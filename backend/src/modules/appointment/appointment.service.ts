import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UserService } from '../user/user.service';
import { PractitionerProfileService } from '../practitioner_profile/practitioner_profile.service';
import { AvailabilityService } from '../availability/availability.service';
import { Availability } from '../availability/entities/availability.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private readonly userService: UserService,
    private readonly practitionerProfileService: PractitionerProfileService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { patientId, practitionerId, date, time, note } = createAppointmentDto;

    // 1. Find Patient (User)
    const patient = await this.userService.findOne(patientId);
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found.`);
    }

    // 2. Find Practitioner Profile
    const practitionerProfile = await this.practitionerProfileService.findOne(practitionerId);
    if (!practitionerProfile) {
      throw new NotFoundException(`Practitioner with ID ${practitionerId} not found.`);
    }

    // 3. Combine date and time to create start_at and calculate end_at
    const startDateTimeString = `${date}T${time}:00`; // Assuming date is YYYY-MM-DD and time is HH:MM
    const start_at = new Date(startDateTimeString);

    if (isNaN(start_at.getTime())) {
      throw new BadRequestException('Invalid date or time format.');
    }

    // Appointment duration is 30 minutes
    const end_at = new Date(start_at.getTime() + 30 * 60 * 1000);

    // Ensure the appointment is not in the past
    if (start_at < new Date()) {
      throw new BadRequestException('Cannot book an appointment in the past.');
    }

    // 4. Find and mark the corresponding Availability slot as booked
    // We need to find an exact matching availability slot for the practitioner
    const availableSlot = await this.availabilityService.findExactSlot(
      practitionerProfile.id,
      start_at,
      end_at
    );

    if (!availableSlot) {
      throw new BadRequestException('No matching availability slot found for this time.');
    }
    if (availableSlot.isBooked) {
      throw new BadRequestException('This slot is already booked.');
    }

    // Mark the slot as booked
    availableSlot.isBooked = true;
    await this.availabilityService.update(availableSlot.id, availableSlot); // Assuming an update method exists

    // 5. Create and save the Appointment entity
    const appointment = this.appointmentRepository.create({
      patient: patient,
      practitioner: practitionerProfile,
      start_at: start_at,
      end_at: end_at,
      notes: note,
      status: AppointmentStatus.CONFIRMED, // Default status
    });

    return this.appointmentRepository.save(appointment);
  }

  findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find();
  }

  async findByPractitionerId(practitionerId: number): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: {
        practitioner: { id: practitionerId },
      },
      relations: ['patient', 'practitioner'], // Include patient and practitioner details
      order: {
        start_at: 'ASC', // Order by start time ascending
      },
    });
  }

  // We will add more methods here later
}
