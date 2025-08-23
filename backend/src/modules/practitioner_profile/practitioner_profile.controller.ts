import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PractitionerProfileService } from './practitioner_profile.service';
import { CreatePractitionerProfileDto } from './dto/create-practitioner_profile.dto';
import { UpdatePractitionerProfileDto } from './dto/update-practitioner_profile.dto';

@Controller('practitioner-profile')
export class PractitionerProfileController {
  constructor(private readonly practitionerProfileService: PractitionerProfileService) {}

  @Post()
  create(@Body() createPractitionerProfileDto: CreatePractitionerProfileDto) {
    return this.practitionerProfileService.create(createPractitionerProfileDto);
  }

  @Get()
  findAll() {
    return this.practitionerProfileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.practitionerProfileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePractitionerProfileDto: UpdatePractitionerProfileDto) {
    return this.practitionerProfileService.update(+id, updatePractitionerProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.practitionerProfileService.remove(+id);
  }
}
