import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PainInputDto } from './dto/pain-input.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PainRecord, HydrationRecord } from './entities/health.entity';
import { painLocations } from '../../utils/painLocations';
import { User } from '../user/entities/user.entity';
import { Activity, ActivityType } from '../activity/entities/activity.entity';
import { Exercise } from '../exercise/entities/exercise.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(PainRecord)
    private painRecordRepository: Repository<PainRecord>,

    @InjectRepository(HydrationRecord)
    private hydrationRecordRepository: Repository<HydrationRecord>,

    @InjectRepository(Activity)
    private actRepo: Repository<Activity>,

    @InjectRepository(Exercise)
    private readonly exerciseRepo: Repository<Exercise>,
  ) {}

  getPainOptions() {
    return painLocations;
  }

  /**
   * L'utilisateur provient du jeton, jamais du corps de requête (SEC-04/05).
   */
  submitPain(dto: PainInputDto, user: User) {
    return this.painRecordRepository.save({
      ...dto,
      user,
      recordedAt: new Date(),
    });
  }

  async getPainsLatest(user: User) {
    // 1️- Douleurs
    const healths = await this.painRecordRepository.find({
      where: { user: { id: user.id } },
      order: { recordedAt: 'DESC' },
      take: 10,
    });

    let lastPainByLocation: Record<string, { level: number; desc: string }> =
      {};

    // Dernier niveau de douleur
    if (healths.length > 0) {
      lastPainByLocation = healths.reduce(
        (acc, pain) => {
          if (pain.painLocation !== undefined) {
            acc[pain.painLocation] = {
              level: pain.painLevel,
              desc: pain.painDescription ?? '',
            };
          }
          return acc;
        },
        {} as Record<string, { level: number; desc: string }>,
      );
    }

    // 2️- Exercices réalisés
    const completed = await this.actRepo.find({
      where: { user: { id: user.id }, type: ActivityType.PAUSE_COMPLETED },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // 3- Exercices réalisés (type pause_completed ou autre)
    const exercises = await Promise.all(
      completed.map(async (act) => {
        const meta = JSON.parse(act.metadata || '{}');
        const exercise = await this.exerciseRepo.findOne({
          where: {
            id: meta.exerciceId,
          },
        });
        if (!exercise) {
          return null;
        }
        return {
          id: exercise.id,
          title: exercise.title,
          image: exercise.image,
        };
      }),
    );
    return {
      lastPainByLocation,
      exercises,
    };
  }

  /**
   * Le relevé était enregistré sans rattachement à un utilisateur : il
   * n'était donc jamais relu par latestHydratation(), qui filtre par user.
   */
  setHydratation(size: string, user: User) {
    return this.hydrationRecordRepository.save({
      bottleSize: size,
      user,
      recordedAt: new Date(),
    });
  }

  async latestHydratation(user: User) {
    const healths = await this.hydrationRecordRepository.find({
      where: { user: { id: user.id } },
      order: { recordedAt: 'DESC' },
      take: 2,
    });

    // Dernier niveau de d'ydrataion
    const lastBottle = healths.length > 0 ? healths[0].bottleSize : null;
    return lastBottle;
  }
}
