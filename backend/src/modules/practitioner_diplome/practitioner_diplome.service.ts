import { Injectable } from '@nestjs/common';
import { CreatePractitionerDiplomeDto } from './dto/create-practitioner_diplome.dto';
import { UpdatePractitionerDiplomeDto } from './dto/update-pratitioner_diplome.dto';

@Injectable()
export class PractitionerDiplomeService {
  create(createPractitionerDiplomeDto: CreatePractitionerDiplomeDto) {
    return 'This action adds a new pratitionerDiplome';
  }

  findAll() {
    return `This action returns all pratitionerDiplome`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pratitionerDiplome`;
  }

  update(id: number, updatePractitionerDiplomeDto: UpdatePractitionerDiplomeDto) {
    return `This action updates a #${id} pratitionerDiplome`;
  }

  remove(id: number) {
    return `This action removes a #${id} pratitionerDiplome`;
  }
}
