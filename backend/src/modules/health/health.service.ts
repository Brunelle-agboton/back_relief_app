import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateHealthDto } from './dto/create-health.dto';
import { PainInputDto } from './dto/pain-input.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Health } from './entities/health.entity';
import { painLocations } from 'src/utils/painLocations';
import { User } from '../user/entities/user.entity';
import { Activity, ActivityType }   from '../activity/entities/activity.entity';
import { Exercise }        from '../exercise/entities/exercise.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(Health)
    private healthRepository: Repository<Health>,

      @InjectRepository(Activity)
      private actRepo: Repository<Activity>,

      @InjectRepository(Exercise)
          private readonly exerciseRepo: Repository<Exercise>,
  ) {}

  getPainOptions() {
    return painLocations;
  }

  submitPain(dto: PainInputDto) {
    return this.healthRepository.save({
      ...dto,
      recordedAt: new Date(),
    });
  }
  
  create(createHealthDto: CreateHealthDto) {
    return 'This action adds a new health';
  }

  async getPainsLatest(user: User) {
        // 1️- Douleurs
      const healths = await this.healthRepository.find({
        where: { user: { id: user.id } },
        order: { recordedAt: 'DESC' },
        take: 10,
      });

      let lastPainByLocation: Record<string, { level: number; desc: string }> = {};

      // Dernier niveau de douleur
      if ( healths.length > 0) {
         lastPainByLocation = healths.reduce((acc, pain) => {
          // on écrase ou on garde le plus récent ? healths est trié desc
          acc[pain.painLocation] = {
            level: pain.painLevel,
            desc:  pain.painDescription
          };
          return acc;
        }, {} as Record<string, { level: number; desc: string }>);
      }

      // 2️- Exercices réalisés
      const completed = await this.actRepo.find({
        where: { user: { id: user.id }, type: ActivityType.PAUSE_COMPLETED },
        order: { createdAt: 'DESC' },
        take: 10,
      });
  
      // 3- Exercices réalisés (type pause_completed ou autre)
    const exercises = await Promise.all(
      completed.map(async act => {
        const meta = JSON.parse(act.metadata || '{}');
        const exercise = await this.exerciseRepo.findOne({
          where: {
            id: meta.exerciceId,
          },
        });
        if (!exercise) {
          return null
        }
        return {
          id: exercise.id,
          title: exercise.title,
          image: exercise.image
        };
      })
    );
    return {
      lastPainByLocation,
      exercises
    }
  }

  findAll() {
    return `This action returns all health`;
  }

  findOne(id: number) {
    return `This action returns a #${id} health`;
  }

  update(id: number, updateHealthDto: PainInputDto) {
    // Update the health record with the new data
    return `This action updates a #${id} health`;
  }

  remove(id: number) {
    return `This action removes a #${id} health`;
  }
}
