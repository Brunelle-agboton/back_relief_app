import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PractitionerDiplomeService } from './practitioner_diplome.service';
import { CreatePractitionerDiplomeDto } from './dto/create-practitioner_diplome.dto';
import { UpdatePractitionerDiplomeDto } from './dto/update-pratitioner_diplome.dto';

@Controller('pratitioner-diplome')
export class PractitionerDiplomeController {
  constructor(private readonly practitionerDiplomeService: PractitionerDiplomeService) {}

  @Post()
  create(@Body() createPractitionerDiplomeDto: CreatePractitionerDiplomeDto) {
    return this.practitionerDiplomeService.create(createPractitionerDiplomeDto);
  }

  @Get()
  findAll() {
    return this.practitionerDiplomeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.practitionerDiplomeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePratitionerDiplomeDto: UpdatePractitionerDiplomeDto) {
    return this.practitionerDiplomeService.update(+id, updatePratitionerDiplomeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.practitionerDiplomeService.remove(+id);
  }
}
