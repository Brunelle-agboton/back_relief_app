import { Injectable }               from '@nestjs/common';
import { InjectRepository }         from '@nestjs/typeorm';
import { Repository }               from 'typeorm';
import {  PainRecord, HydrationRecord  }                     from '../health/entities/health.entity';
import { Activity, ActivityType }   from '../activity/entities/activity.entity';
import { User }                     from '../user/entities/user.entity';
import { ProgramLine }        from '../program-line/entities/program-line.entity';

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(PainRecord)
    private healthRepo: Repository<PainRecord>,

    @InjectRepository(Activity)
    private actRepo: Repository<Activity>,

    @InjectRepository(ProgramLine)
    private readonly programLineRepo: Repository<ProgramLine>,
  ) {}

  /** Retourne le résumé pour un user donné */
  async getSummaryForUser(user: User) {
    // 1️⃣ Douleurs
    const healths = await this.healthRepo.find({
      where: { user: { id: user.id } },
      order: { recordedAt: 'DESC' },
      take: 10, // par exemple
    });

    
    // 2️⃣ Exercices réalisés
    const completed = await this.actRepo.find({
      where: { user: { id: user.id }, type: ActivityType.PAUSE_COMPLETED },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // 2️⃣ Exercices réalisés (type pause_completed ou autre)
    const exercises = await Promise.all(
      completed.map(async act => {
        const meta = JSON.parse(act.metadata || '{}');
        const progLine = await this.programLineRepo.findOne({
          where: {
            exercise: { id: meta.exerciceId },
            order: meta.lineOrder,
          },
          relations: ['exercise'],
        });
        if (!progLine) {
          return {
            id: act.id,
            name: 'Unknown exercise',
            duration: '0s',
            calories: 0,
            date: act.createdAt.toISOString().split('T')[0],
          };
        }
        return {
          id: act.id,
          name:     progLine.exercise.title,
          duration: `${progLine.duration ?? 0} s`,
          calories: progLine.calories ?? 0,
          date:     act.createdAt.toISOString().split('T')[0],
        };
      })
    );

    // 3️⃣ Notifications paramétrées
    // On récupère directement du user, via restReminder/drinkReminder
    // et on peut calculer l’heure “time” par convention ou stocker en metadata
    // Ici, on renvoie un tableau minimal
    const notifSettings = [
      { id: 1, time: `${user.hourSit}:00`, title: 'Pause Active', active: user.restReminder },
      { id: 2, time: `${user.hourSit + 2}:00`, title: 'Boire de l\'eau', active: user.drinkReminder }
    ];

    return {
      healthHistory: healths.map(p => ({
        id: p.id,
        level: p.painLevel,
        location: p.painLocation,
        description: p.painDescription,
        timestamp: p.recordedAt,
      })),
      exercises,
      notifications: notifSettings,
    };
  }

  async getUserHealth(user: User) {
    // 1️⃣ Douleurs
  const healths = await this.healthRepo.find({
    where: { user: { id: user.id } },
    order: { recordedAt: 'DESC' },
    take: 10,
  });
  // Dernier niveau de douleur
  const painLevel = healths.length > 0 ? healths[0].painLevel : null;

  // 2️⃣ Exercices réalisés
  const completed = await this.actRepo.find({
    where: { user: { id: user.id }, type: ActivityType.PAUSE_COMPLETED },
    order: { createdAt: 'DESC' },
    take: 1000, // pour le streak, on prend large
  });

  // Nombre total d'exercices réalisés
  const nbExercises = completed.length;

  // Calcul du streak (jours consécutifs)
  const daysSet = new Set(
    completed.map(act => act.createdAt.toISOString().split('T')[0])
  );
  const days = Array.from(daysSet).sort().reverse(); // du plus récent au plus ancien

  let streakDays = 0;
  let current = days[0] ? new Date(days[0]) : null;
  while (current && days.includes(current.toISOString().split('T')[0])) {
    streakDays++;
    current.setDate(current.getDate() - 1);
  }

  // ... (le reste de ton code)

  return {
    painLevel,
    nbExercises,
    streakDays    
  };
  }
}
