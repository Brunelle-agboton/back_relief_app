import { Injectable } from '@nestjs/common';
import { CreatePractitionerProfileDto } from './dto/create-practitioner_profile.dto';
import { UpdatePractitionerProfileDto } from './dto/update-practitioner_profile.dto';

@Injectable()
export class PractitionerProfileService {
  create(createPractitionerProfileDto: CreatePractitionerProfileDto) {
    return 'This action adds a new practitionerProfile';
  }

  findAll() {
    return `This action returns all practitionerProfile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} practitionerProfile`;
  }

  update(id: number, updatePractitionerProfileDto: UpdatePractitionerProfileDto) {
    return `This action updates a #${id} practitionerProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} practitionerProfile`;
  }
}
