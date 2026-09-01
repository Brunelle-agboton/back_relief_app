import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProgramLineService } from './program-line.service';
import { CreateProgramLineDto } from './dto/create-program-line.dto';
import { UpdateProgramLineDto } from './dto/update-program-line.dto';

import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

/**
 * Catalogue d'exercices : lecture réservée aux utilisateurs authentifiés,
 * écriture réservée à l'administration (le contenu était jusqu'ici modifiable
 * par n'importe quel appelant anonyme).
 */
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('program-line')
export class ProgramLineController {
  constructor(private readonly programLineService: ProgramLineService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createProgramLineDto: CreateProgramLineDto) {
    return this.programLineService.create(createProgramLineDto);
  }

  @Get()
  findAll() {
    return this.programLineService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programLineService.findOne(+id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProgramLineDto: UpdateProgramLineDto,
  ) {
    return this.programLineService.update(+id, updateProgramLineDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programLineService.remove(+id);
  }
}
