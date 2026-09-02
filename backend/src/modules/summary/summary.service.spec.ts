import { Test, TestingModule } from '@nestjs/testing';
import { SummaryService } from './summary.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PainRecord } from '../health/entities/health.entity';
import { Activity, ActivityType } from '../activity/entities/activity.entity';
import { ProgramLine } from '../program-line/entities/program-line.entity';
import { User } from '../user/entities/user.entity';
import { Exercise } from '../exercise/entities/exercise.entity';
import { Repository } from 'typeorm';
import {
  UUID_A,
  UUID_B,
  UUID_C,
  UUID_D,
  UUID_E,
  UUID_MISSING,
} from '../../common/testing/uuid.fixtures';

describe('SummaryService', () => {
  let service: SummaryService;
  let healthRepo: Repository<PainRecord>;
  let actRepo: Repository<Activity>;
  let programLineRepo: Repository<ProgramLine>;

  const mockHealthRepo = {
    find: jest.fn(),
  };

  const mockActRepo = {
    find: jest.fn(),
  };

  const mockProgramLineRepo = {
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummaryService,
        {
          provide: getRepositoryToken(PainRecord),
          useValue: mockHealthRepo,
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: mockActRepo,
        },
        {
          provide: getRepositoryToken(ProgramLine),
          useValue: mockProgramLineRepo,
        },
      ],
    }).compile();

    service = module.get<SummaryService>(SummaryService);
    healthRepo = module.get<Repository<PainRecord>>(
      getRepositoryToken(PainRecord),
    );
    actRepo = module.get<Repository<Activity>>(getRepositoryToken(Activity));
    programLineRepo = module.get<Repository<ProgramLine>>(
      getRepositoryToken(ProgramLine),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummaryForUser', () => {
    const makeUser = () => {
      const user = new User();
      user.id = UUID_A;
      user.hourSit = 8;
      user.restReminder = true;
      user.drinkReminder = false;
      return user;
    };

    it('retourne un résumé vide pour un utilisateur sans données', async () => {
      mockHealthRepo.find.mockResolvedValue([]);
      mockActRepo.find.mockResolvedValue([]);

      const result = await service.getSummaryForUser(makeUser());

      expect(result.healthHistory).toHaveLength(0);
      expect(result.exercises).toHaveLength(0);
      expect(result.notifications).toHaveLength(2);
    });

    it("inclut les paramètres de notification de l'utilisateur", async () => {
      mockHealthRepo.find.mockResolvedValue([]);
      mockActRepo.find.mockResolvedValue([]);

      const result = await service.getSummaryForUser(makeUser());

      expect(result.notifications[0]).toMatchObject({
        title: 'Pause Active',
        active: true,
      });
      expect(result.notifications[1]).toMatchObject({
        title: "Boire de l'eau",
        active: false,
      });
    });

    it('retourne "Unknown exercise" si la programLine est introuvable', async () => {
      const act = Object.assign(new Activity(), {
        id: UUID_A,
        metadata: JSON.stringify({ exerciceId: UUID_MISSING, lineOrder: 1 }),
        createdAt: new Date('2026-05-28T10:00:00.000Z'),
        type: ActivityType.PAUSE_COMPLETED,
      });
      mockHealthRepo.find.mockResolvedValue([]);
      mockActRepo.find.mockResolvedValue([act]);
      // MET-11 : une requête groupée remplace le findOne par activité.
      mockProgramLineRepo.find.mockResolvedValue([]);

      const result = await service.getSummaryForUser(makeUser());

      expect(result.exercises[0]).toMatchObject({
        name: 'Unknown exercise',
        calories: 0,
        duration: '0s',
      });
    });

    it("retourne les détails de l'exercice si la programLine est trouvée", async () => {
      const act = Object.assign(new Activity(), {
        id: UUID_B,
        metadata: JSON.stringify({ exerciceId: UUID_A, lineOrder: 1 }),
        createdAt: new Date('2026-05-28T10:00:00.000Z'),
        type: ActivityType.PAUSE_COMPLETED,
      });
      const exercise = Object.assign(new Exercise(), {
        title: 'Gainage',
        id: UUID_A,
      });
      const progLine = Object.assign(new ProgramLine(), {
        exercise,
        order: 1,
        duration: 30,
        calories: 5,
      });
      mockHealthRepo.find.mockResolvedValue([]);
      mockActRepo.find.mockResolvedValue([act]);
      mockProgramLineRepo.find.mockResolvedValue([progLine]);

      const result = await service.getSummaryForUser(makeUser());

      expect(result.exercises[0]).toMatchObject({
        name: 'Gainage',
        duration: '30 s',
        calories: 5,
      });
    });

    // MET-11 : N+1 supprimé — une seule requête quel que soit le nombre d'activités.
    it("ne fait qu'une requête programLine pour plusieurs activités", async () => {
      const acts = [UUID_A, UUID_B, UUID_C].map((id) =>
        Object.assign(new Activity(), {
          id,
          metadata: JSON.stringify({ exerciceId: id, lineOrder: 1 }),
          createdAt: new Date('2026-05-28T10:00:00.000Z'),
          type: ActivityType.PAUSE_COMPLETED,
        }),
      );
      mockHealthRepo.find.mockResolvedValue([]);
      mockActRepo.find.mockResolvedValue(acts);
      mockProgramLineRepo.find.mockResolvedValue([]);

      await service.getSummaryForUser(makeUser());

      expect(mockProgramLineRepo.find).toHaveBeenCalledTimes(1);
      expect(mockProgramLineRepo.findOne).not.toHaveBeenCalled();
    });

    // MET-11 : une métadonnée corrompue ne doit plus faire tomber la route.
    it('ignore une métadonnée JSON malformée sans lever', async () => {
      const act = Object.assign(new Activity(), {
        id: UUID_B,
        metadata: 'pas du json du tout',
        createdAt: new Date('2026-05-28T10:00:00.000Z'),
        type: ActivityType.PAUSE_COMPLETED,
      });
      mockHealthRepo.find.mockResolvedValue([]);
      mockActRepo.find.mockResolvedValue([act]);

      const result = await service.getSummaryForUser(makeUser());

      expect(result.exercises[0]).toMatchObject({ name: 'Unknown exercise' });
      expect(mockProgramLineRepo.find).not.toHaveBeenCalled();
    });
  });

  describe('getUserHealth', () => {
    it('retourne painLevel null et streak 0 sans données', async () => {
      const user = Object.assign(new User(), { id: UUID_A });
      mockHealthRepo.find.mockResolvedValue([]);
      mockActRepo.find.mockResolvedValue([]);

      const result = await service.getUserHealth(user);

      expect(result.painLevel).toBeNull();
      expect(result.nbExercises).toBe(0);
      expect(result.streakDays).toBe(0);
    });

    it('retourne le dernier niveau de douleur', async () => {
      const pain = Object.assign(new PainRecord(), {
        painLevel: 7,
        recordedAt: new Date(),
      });
      const user = Object.assign(new User(), { id: UUID_A });
      mockHealthRepo.find.mockResolvedValue([pain]);
      mockActRepo.find.mockResolvedValue([]);

      const result = await service.getUserHealth(user);

      expect(result.painLevel).toBe(7);
    });

    it('calcule un streak de 3 jours consécutifs', async () => {
      const user = Object.assign(new User(), { id: UUID_A });
      const makeAct = (dateStr: string) =>
        Object.assign(new Activity(), {
          createdAt: new Date(dateStr),
          type: ActivityType.PAUSE_COMPLETED,
        });

      mockHealthRepo.find.mockResolvedValue([]);
      mockActRepo.find.mockResolvedValue([
        makeAct('2026-05-28T10:00:00.000Z'),
        makeAct('2026-05-27T10:00:00.000Z'),
        makeAct('2026-05-26T10:00:00.000Z'),
      ]);

      const result = await service.getUserHealth(user);

      expect(result.nbExercises).toBe(3);
      expect(result.streakDays).toBe(3);
    });

    it("s'arrête au premier jour manquant dans le streak", async () => {
      const user = Object.assign(new User(), { id: UUID_A });
      const makeAct = (dateStr: string) =>
        Object.assign(new Activity(), {
          createdAt: new Date(dateStr),
          type: ActivityType.PAUSE_COMPLETED,
        });

      mockHealthRepo.find.mockResolvedValue([]);
      // 2026-05-25 manquant — streak de 2 seulement
      mockActRepo.find.mockResolvedValue([
        makeAct('2026-05-28T10:00:00.000Z'),
        makeAct('2026-05-27T10:00:00.000Z'),
        makeAct('2026-05-24T10:00:00.000Z'),
      ]);

      const result = await service.getUserHealth(user);

      expect(result.streakDays).toBe(2);
    });
  });
});
