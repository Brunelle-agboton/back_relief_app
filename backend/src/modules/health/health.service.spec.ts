import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PainRecord, HydrationRecord } from './entities/health.entity';
import { Activity, ActivityType } from '../activity/entities/activity.entity';
import { Exercise } from '../exercise/entities/exercise.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { PainInputDto } from './dto/pain-input.dto';
import {
  UUID_A,
  UUID_B,
  UUID_C,
  UUID_D,
  UUID_E,
  UUID_MISSING,
} from '../../common/testing/uuid.fixtures';

describe('HealthService', () => {
  let service: HealthService;
  let painRecordRepository: Repository<PainRecord>;
  let hydrationRecordRepository: Repository<HydrationRecord>;
  let activityRepository: Repository<Activity>;
  let exerciseRepository: Repository<Exercise>;

  const mockPainRecordRepository = {
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockHydrationRecordRepository = {
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockActivityRepository = {
    find: jest.fn(),
  };

  const mockExerciseRepository = {
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getRepositoryToken(PainRecord),
          useValue: mockPainRecordRepository,
        },
        {
          provide: getRepositoryToken(HydrationRecord),
          useValue: mockHydrationRecordRepository,
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: mockActivityRepository,
        },
        {
          provide: getRepositoryToken(Exercise),
          useValue: mockExerciseRepository,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    painRecordRepository = module.get<Repository<PainRecord>>(
      getRepositoryToken(PainRecord),
    );
    hydrationRecordRepository = module.get<Repository<HydrationRecord>>(
      getRepositoryToken(HydrationRecord),
    );
    activityRepository = module.get<Repository<Activity>>(
      getRepositoryToken(Activity),
    );
    exerciseRepository = module.get<Repository<Exercise>>(
      getRepositoryToken(Exercise),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPainOptions', () => {
    it('should return pain locations', () => {
      expect(service.getPainOptions()).toBeDefined();
    });
  });

  describe('submitPain', () => {
    it("rattache le relevé à l'utilisateur fourni par le contrôleur", async () => {
      const dto: PainInputDto = {
        painLocation: 'Bas du dos',
        painLevel: 5,
        painDescription: '',
      };
      const user = new User();
      user.id = UUID_C;

      await service.submitPain(dto, user);

      expect(painRecordRepository.save).toHaveBeenCalledWith({
        ...dto,
        user,
        recordedAt: expect.any(Date),
      });
    });
  });

  describe('getPainsLatest', () => {
    it('should return latest pains', async () => {
      const user = new User();
      const painRecord = new PainRecord();
      painRecord.painLocation = 'head';
      painRecord.painLevel = 5;
      painRecord.painDescription = 'headache';
      mockPainRecordRepository.find.mockResolvedValue([painRecord]);
      mockActivityRepository.find.mockResolvedValue([]);
      mockExerciseRepository.findOne.mockResolvedValue(null);

      const result = await service.getPainsLatest(user);

      expect(painRecordRepository.find).toHaveBeenCalled();
      expect(activityRepository.find).toHaveBeenCalled();
      expect(result.lastPainByLocation).toEqual({
        head: { level: 5, desc: 'headache' },
      });
    });

    it('utilise une chaîne vide quand painDescription est null', async () => {
      const user = new User();
      const painRecord = new PainRecord();
      painRecord.painLocation = 'épaule';
      painRecord.painLevel = 3;
      painRecord.painDescription = null;
      mockPainRecordRepository.find.mockResolvedValue([painRecord]);
      mockActivityRepository.find.mockResolvedValue([]);

      const result = await service.getPainsLatest(user);

      expect(result.lastPainByLocation['épaule'].desc).toBe('');
    });

    it('retourne un objet vide quand aucune douleur enregistrée', async () => {
      const user = new User();
      mockPainRecordRepository.find.mockResolvedValue([]);
      mockActivityRepository.find.mockResolvedValue([]);

      const result = await service.getPainsLatest(user);

      expect(result.lastPainByLocation).toEqual({});
    });

    it('should return null for exercise if not found', async () => {
      const user = new User();
      const activity = new Activity();
      activity.metadata = JSON.stringify({ exerciceId: UUID_A });
      mockPainRecordRepository.find.mockResolvedValue([]);
      mockActivityRepository.find.mockResolvedValue([activity]);
      // MET-11 : une seule requête groupée remplace le findOne par activité.
      mockExerciseRepository.find.mockResolvedValue([]);

      const result = await service.getPainsLatest(user);

      expect(result.exercises).toEqual([null]);
    });

    it('should return exercise details if found', async () => {
      const user = new User();
      const activity = new Activity();
      activity.metadata = JSON.stringify({ exerciceId: UUID_A });
      const exercise = new Exercise();
      exercise.id = UUID_A;
      exercise.title = 'test exercise';
      exercise.image = 'test.jpg';
      mockPainRecordRepository.find.mockResolvedValue([]);
      mockActivityRepository.find.mockResolvedValue([activity]);
      mockExerciseRepository.find.mockResolvedValue([exercise]);

      const result = await service.getPainsLatest(user);

      // Une seule requête, quel que soit le nombre d'activités.
      expect(mockExerciseRepository.find).toHaveBeenCalledTimes(1);
      expect(result.exercises).toEqual([
        { id: UUID_A, title: 'test exercise', image: 'test.jpg' },
      ]);
    });

    // Depuis les clés uuid : un exerciceId qui n'est pas un UUID atteindrait
    // une colonne uuid et ferait échouer la requête PostgreSQL en 500.
    it("ignore un exerciceId qui n'est pas un UUID", async () => {
      const user = new User();
      const activity = new Activity();
      activity.metadata = JSON.stringify({ exerciceId: 'abc' });
      mockPainRecordRepository.find.mockResolvedValue([]);
      mockActivityRepository.find.mockResolvedValue([activity]);
      mockExerciseRepository.find.mockResolvedValue([]);

      const result = await service.getPainsLatest(user);

      expect(result.exercises).toEqual([null]);
      expect(mockExerciseRepository.find).not.toHaveBeenCalled();
    });

    // MET-11 : une métadonnée corrompue ne doit plus faire tomber la route.
    it('ignore une métadonnée JSON malformée sans lever', async () => {
      const user = new User();
      const activity = new Activity();
      activity.metadata = '{ ceci nest pas du json';
      mockPainRecordRepository.find.mockResolvedValue([]);
      mockActivityRepository.find.mockResolvedValue([activity]);
      mockExerciseRepository.find.mockResolvedValue([]);

      const result = await service.getPainsLatest(user);

      expect(result.exercises).toEqual([null]);
      expect(mockExerciseRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('setHydratation', () => {
    it('should save a hydration record', async () => {
      const size = '500ml';
      const hydrationRecord = new HydrationRecord();
      mockHydrationRecordRepository.save.mockResolvedValue(hydrationRecord);

      const user = new User();
      user.id = UUID_C;

      const result = await service.setHydratation(size, user);

      // Le relevé était enregistré sans utilisateur : il n'était jamais relu.
      expect(hydrationRecordRepository.save).toHaveBeenCalledWith({
        bottleSize: size,
        user,
        recordedAt: expect.any(Date),
      });
      expect(result).toEqual(hydrationRecord);
    });
  });

  describe('latestHydratation', () => {
    it('should return latest hydratation', async () => {
      const user = new User();
      const hydrationRecord = new HydrationRecord();
      hydrationRecord.bottleSize = '500ml';
      mockHydrationRecordRepository.find.mockResolvedValue([hydrationRecord]);

      const result = await service.latestHydratation(user);

      expect(hydrationRecordRepository.find).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
        order: { recordedAt: 'DESC' },
        take: 2,
      });
      expect(result).toEqual('500ml');
    });

    it('should return null if no hydration record is found', async () => {
      const user = new User();
      mockHydrationRecordRepository.find.mockResolvedValue([]);

      const result = await service.latestHydratation(user);

      expect(hydrationRecordRepository.find).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  // SEC-04 : les méthodes de scaffolding (findAll / findOne / update / remove,
  // qui renvoyaient des chaînes littérales sur des routes publiques) ont été
  // supprimées avec les routes qu'elles servaient.
  describe('surface du service', () => {
    it("n'expose plus les méthodes de scaffolding", () => {
      expect((service as any).create).toBeUndefined();
      expect((service as any).findAll).toBeUndefined();
      expect((service as any).findOne).toBeUndefined();
      expect((service as any).update).toBeUndefined();
      expect((service as any).remove).toBeUndefined();
    });
  });
});
