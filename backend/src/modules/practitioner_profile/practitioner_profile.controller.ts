import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  UseGuards,
  Req,
  NotFoundException,
  ForbiddenException,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PractitionerProfileService } from './practitioner_profile.service';
import { CreatePractitionerProfileDto } from './dto/create-practitioner_profile.dto';
import { UpdatePractitionerProfileDto } from './dto/update-practitioner_profile.dto';
import { CompletePractitionerProfileDto } from './dto/complete-practitioner_profile.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AddAvailabilityToPractitionerDto } from './dto/add-availability-to-practitioner.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { isAdmin } from '../../common/guards/ownership';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { isPubliclyListedPractitioner } from './public-practitioners';

@Controller('practitioner-profile')
@UseInterceptors(ClassSerializerInterceptor)
export class PractitionerProfileController {
  constructor(
    private readonly practitionerProfileService: PractitionerProfileService,
  ) {}

  /* --------------------------------------------------------------- Public */

  /**
   * SEC-04 : seule route publique du module. Elle ne répond que pour les
   * adresses explicitement publiées (PUBLIC_PRACTITIONER_EMAILS) et ne renvoie
   * qu'une projection sans donnée de compte — plus d'énumération d'e-mails.
   */
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Get('by-email/:email')
  getProfileByEmail(@Param('email') email: string) {
    if (!isPubliclyListedPractitioner(email)) {
      throw new NotFoundException('Praticien introuvable');
    }
    return this.practitionerProfileService.findPublicByEmail(email);
  }

  /* ------------------------------------------------- Profil de l'appelant */

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.practitionerProfileService.findForUser(req.user.userId);
  }

  /**
   * SEC-07 : `req.user` était explicitement ignoré (ligne commentée) et le
   * profil ciblé provenait du corps de requête — n'importe quel praticien
   * pouvait créer des créneaux pour un autre praticien.
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('me/availability')
  async addAvailability(
    @Req() req: AuthenticatedRequest,
    @Body() addAvailabilityDto: AddAvailabilityToPractitionerDto,
  ) {
    const profile = await this.practitionerProfileService.findForUser(
      req.user.userId,
    );
    return this.practitionerProfileService.addAvailability(
      profile.id,
      addAvailabilityDto,
    );
  }

  /* ---------------------------------------------- Ressource ciblée par :id */

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('complete-profile/:id')
  async completePractionerProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() completePractitionerProfileDto: CompletePractitionerProfileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.assertMayWrite(id, req);
    return this.practitionerProfileService.completePractionerProfile(
      id,
      completePractitionerProfileDto,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.practitionerProfileService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.assertMayWrite(id, req);
    return this.practitionerProfileService.findOne(id);
  }

  /** SEC-07 : aucun contrôle de propriété n'était effectué. */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePractitionerProfileDto: UpdatePractitionerProfileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.assertMayWrite(id, req);
    return this.practitionerProfileService.update(
      id,
      updatePractitionerProfileDto,
    );
  }

  /** SEC-07 : aucun contrôle de propriété n'était effectué. */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.assertMayWrite(id, req);
    return this.practitionerProfileService.remove(id);
  }

  /** Création réservée à l'administration : le parcours public passe par /auth/register-practitioner. */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createPractitionerProfileDto: CreatePractitionerProfileDto) {
    return this.practitionerProfileService.create(createPractitionerProfileDto);
  }

  private async assertMayWrite(
    profileId: string,
    req: AuthenticatedRequest,
  ): Promise<void> {
    if (isAdmin(req.user)) {
      return;
    }
    if (req.user.role !== UserRole.PRACTITIONER) {
      throw new ForbiddenException('Réservé aux praticiens');
    }
    await this.practitionerProfileService.assertOwnedBy(
      profileId,
      req.user.userId,
    );
  }
}
