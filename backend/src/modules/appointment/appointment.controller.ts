import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { assertSelfOrAdmin, isAdmin } from '../../common/guards/ownership';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { PractitionerProfileService } from '../practitioner_profile/practitioner_profile.service';

/**
 * SEC-04 : l'ensemble des rendez-vous patient ↔ praticien (donnée de santé au
 * sens de l'article 9 du RGPD) était accessible sans aucune authentification.
 */
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly practitionerProfileService: PractitionerProfileService,
  ) {}

  @Post()
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // SEC-07 : un patient ne peut réserver que pour lui-même ; seul un
    // administrateur peut désigner un autre patient.
    const patientId =
      isAdmin(req.user) && createAppointmentDto.patientId
        ? createAppointmentDto.patientId
        : req.user.userId;

    return this.appointmentService.create({
      ...createAppointmentDto,
      patientId,
    });
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }

  /** SEC-04/07 : l'agenda médical d'un patient donné, par simple `:id`. */
  @Get('as-patient/:id')
  findByUserId(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    assertSelfOrAdmin(req.user, id);
    return this.appointmentService.findByUserId(id);
  }

  /** `:id` désigne ici un profil praticien, qui doit appartenir à l'appelant. */
  @Get('practitioner/:id')
  async findByPractitionerId(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!isAdmin(req.user)) {
      const profile = await this.practitionerProfileService.findForUser(
        req.user.userId,
      );
      if (profile.id !== id) {
        throw new ForbiddenException('Accès limité à votre propre agenda');
      }
    }
    return this.appointmentService.findByPractitionerId(id);
  }
}
