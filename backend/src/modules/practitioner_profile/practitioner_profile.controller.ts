import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { PractitionerProfileService } from './practitioner_profile.service';
import { CreatePractitionerProfileDto } from './dto/create-practitioner_profile.dto';
import { UpdatePractitionerProfileDto } from './dto/update-practitioner_profile.dto';
import { CompletePractitionerProfileDto } from './dto/complete-practitioner_profile.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AddAvailabilityToPractitionerDto } from './dto/add-availability-to-practitioner.dto';

@Controller('practitioner-profile')
@UseInterceptors(ClassSerializerInterceptor)
export class PractitionerProfileController {
  constructor(private readonly practitionerProfileService: PractitionerProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    // The JwtAuthGuard attaches the user object (from the token payload) to the request
    const userId = req.user.userId;
    return this.practitionerProfileService.findForUser(userId);
  }

  @Get('by-email/:email')
  getProfileByEmail(@Param('email') email: string) {
    return this.practitionerProfileService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/availability')
  addAvailability(@Request() req, @Body() addAvailabilityDto: AddAvailabilityToPractitionerDto) {
    // const userId = req.user.sub;
    return this.practitionerProfileService.addAvailability(addAvailabilityDto);
  }
  
  @Post()
  create(@Body() createPractitionerProfileDto: CreatePractitionerProfileDto) {
    return this.practitionerProfileService.create(createPractitionerProfileDto);
  }

    @UseGuards(JwtAuthGuard)
  @Patch('complete-profile/:id')
  completePractionerProfile(@Param('id') id: string, @Body() completePractitionerProfileDto: CompletePractitionerProfileDto) {
    return this.practitionerProfileService.completePractionerProfile(+id,completePractitionerProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.practitionerProfileService.findAll();
  }
@UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.practitionerProfileService.findOne(+id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePractitionerProfileDto: UpdatePractitionerProfileDto) {
    return this.practitionerProfileService.update(+id, updatePractitionerProfileDto);
  }
@UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.practitionerProfileService.remove(+id);
  }
}
