import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PractitionerDiplomeService } from './practitioner_diplome.service';
import { CreatePractitionerDiplomeDto } from './dto/create-practitioner_diplome.dto';
import { UpdatePractitionerDiplomeDto } from './dto/update-pratitioner_diplome.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { isAdmin } from '../../common/guards/ownership';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { PractitionerProfileService } from '../practitioner_profile/practitioner_profile.service';

/**
 * SEC-04 : les diplômes et pièces justificatives des praticiens étaient
 * listables et modifiables sans aucune authentification.
 *
 * Le chemin `pratitioner-diplome` (avec sa coquille) est conservé tel quel pour
 * ne pas casser les clients déjà déployés.
 */
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pratitioner-diplome')
export class PractitionerDiplomeController {
  constructor(
    private readonly practitionerDiplomeService: PractitionerDiplomeService,
    private readonly practitionerProfileService: PractitionerProfileService,
  ) {}

  /** Le diplôme est systématiquement rattaché au profil praticien de l'appelant. */
  @Post()
  async create(
    @Body() createPractitionerDiplomeDto: CreatePractitionerDiplomeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.role !== UserRole.PRACTITIONER && !isAdmin(req.user)) {
      throw new ForbiddenException('Réservé aux praticiens');
    }
    const profile = await this.practitionerProfileService.findForUser(
      req.user.userId,
    );
    return this.practitionerDiplomeService.create(
      createPractitionerDiplomeDto,
      profile.id,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.practitionerDiplomeService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.practitionerDiplomeService.findOneOwnedBy(
      id,
      req.user.userId,
      isAdmin(req.user),
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePratitionerDiplomeDto: UpdatePractitionerDiplomeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.practitionerDiplomeService.update(
      id,
      updatePratitionerDiplomeDto,
      req.user.userId,
      isAdmin(req.user),
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.practitionerDiplomeService.remove(
      id,
      req.user.userId,
      isAdmin(req.user),
    );
  }
}
