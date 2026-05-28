import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PractitionerDiplome } from './entities/practitioner_diplome.entity';
import { CreatePractitionerDiplomeDto } from './dto/create-practitioner_diplome.dto';
import { UpdatePractitionerDiplomeDto } from './dto/update-pratitioner_diplome.dto';

@Injectable()
export class PractitionerDiplomeService {
  constructor(
    @InjectRepository(PractitionerDiplome)
    private readonly repo: Repository<PractitionerDiplome>,
  ) {}

  async create(dto: CreatePractitionerDiplomeDto, profileId?: number): Promise<PractitionerDiplome> {
    const diplome = this.repo.create({
      ...dto,
      ...(profileId ? { practitionerProfile: { id: profileId } as any } : {}),
    });
    return this.repo.save(diplome);
  }

  async findAll(): Promise<PractitionerDiplome[]> {
    return this.repo.find({ relations: ['practitionerProfile'] });
  }

  async findByProfile(profileId: number): Promise<PractitionerDiplome[]> {
    return this.repo.find({
      where: { practitionerProfile: { id: profileId } },
    });
  }

  async findOne(id: number): Promise<PractitionerDiplome> {
    const diplome = await this.repo.findOne({ where: { id }, relations: ['practitionerProfile'] });
    if (!diplome) throw new NotFoundException(`Diplome #${id} not found`);
    return diplome;
  }

  async update(id: number, dto: UpdatePractitionerDiplomeDto): Promise<PractitionerDiplome> {
    const diplome = await this.findOne(id);
    Object.assign(diplome, dto);
    return this.repo.save(diplome);
  }

  async remove(id: number): Promise<void> {
    const diplome = await this.findOne(id);
    await this.repo.remove(diplome);
  }
}
