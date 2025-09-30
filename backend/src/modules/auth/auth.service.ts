import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { PractitionerProfileService } from '../practitioner_profile/practitioner_profile.service';
import { AppointmentService } from '../appointment/appointment.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreatePractitionerProfileDto } from '../practitioner_profile/dto/create-practitioner_profile.dto';
import { CreateAppointmentDto } from '../appointment/dto/create-appointment.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private practitionerProfileService: PractitionerProfileService,
    private appointmentService: AppointmentService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerPractitioner(dto: any): Promise<any> {
    const { email, password, userName, ...profileData } = dto;

    // Create user
    const createUserDto: CreateUserDto = { email, password, userName, role: 'practitioner' };
    const user = await this.usersService.create(createUserDto);

    // Create practitioner profile
    const createProfileDto: CreatePractitionerProfileDto = {
      userId: user.id,
      ...profileData,
    };
    const profile = await this.practitionerProfileService.create(createProfileDto);

    // Create an appointment with the admin practitioner (user ID 2) for the new practitioner
    const { appointment } = dto;
    const createAppointmentDto: CreateAppointmentDto = {
      patientId: user.id, // The new practitioner is the "patient" for this onboarding appointment
      practitionerId: 1, // The admin practitioner's ID
      date: appointment.date, // Assuming this is a 'YYYY-MM-DD' string from the DTO
      time: appointment.startTime, // Assuming this is a 'HH:MM' string from the DTO
    };
    const newAppointment = await this.appointmentService.create(
      createAppointmentDto,
    );

    return { user, profile, appointment: newAppointment };
  }
}