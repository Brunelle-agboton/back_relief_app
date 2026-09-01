import { ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateUserDto } from '../../modules/user/dto/create-user.dto';
import { CreateActivityDto } from '../../modules/activity/dto/create-activity.dto';
import { PainInputDto } from '../../modules/health/dto/pain-input.dto';
import { CompletePractitionerProfileDto } from '../../modules/practitioner_profile/dto/complete-practitioner_profile.dto';
import { RegisterPractitionerDto } from '../../modules/auth/dto/register-practitioner.dto';
import { ActivityType } from '../../modules/activity/entities/activity.entity';
import {
  EstablishmentType,
  ProfessionalType,
} from '../../modules/practitioner_profile/entities/practitioner_profile.entity';

/**
 * SEC-05 : ces coercitions sont ce qui permet d'activer le ValidationPipe
 * global sans casser les clients mobiles déjà publiés, qui transmettent des
 * chaînes là où le DTO attend des tableaux, des objets ou des nombres.
 */
const build = <T extends object>(cls: new () => T, plain: object) =>
  plainToInstance(cls, plain, { excludeExtraneousValues: false }) as T;

describe('Coercitions de DTO (ValidationPipe global)', () => {
  describe('CreateUserDto', () => {
    it("normalise l'e-mail (trim + minuscules)", () => {
      const dto = build(CreateUserDto, {
        userName: 'Jean',
        email: '  Jean.Test@Example.COM ',
        password: 'password123',
      });
      expect(dto.email).toBe('jean.test@example.com');
      expect(validateSync(dto)).toHaveLength(0);
    });

    it('convertit les nombres transmis en chaînes', () => {
      const dto = build(CreateUserDto, {
        userName: 'Jean',
        email: 'jean@test.com',
        password: 'password123',
        age: '42',
        poids: '70',
      });
      expect(dto.age).toBe(42);
      expect(dto.poids).toBe(70);
      expect(validateSync(dto)).toHaveLength(0);
    });

    it('ignore les champs numériques vides plutôt que de produire NaN', () => {
      // Le client envoie parseInt('') === NaN quand l'utilisateur ne renseigne
      // pas sa fréquence d'entraînement.
      const dto = build(CreateUserDto, {
        userName: 'Jean',
        email: 'jean@test.com',
        password: 'password123',
        numberTraining: NaN,
        hourSit: '',
      });
      expect(dto.numberTraining).toBeUndefined();
      expect(dto.hourSit).toBeUndefined();
      expect(validateSync(dto)).toHaveLength(0);
    });

    it('rejette un e-mail invalide et un mot de passe trop court', () => {
      const dto = build(CreateUserDto, {
        userName: 'Jean',
        email: 'nope',
        password: '12',
      });
      const errors = validateSync(dto);
      expect(errors.map((e) => e.property).sort()).toEqual([
        'email',
        'password',
      ]);
    });

    // SEC-03 : `role` n'existe plus dans le DTO, et le mode whitelist du
    // ValidationPipe global le retire du corps de requête.
    it('retire le champ role envoyé par le client', async () => {
      const pipe = new ValidationPipe({ whitelist: true, transform: true });
      const result = await pipe.transform(
        {
          userName: 'Jean',
          email: 'jean@test.com',
          password: 'password123',
          role: 'practitioner',
        },
        { type: 'body', metatype: CreateUserDto },
      );

      expect(result).not.toHaveProperty('role');
    });
  });

  describe('CreateActivityDto', () => {
    it("sérialise un metadata transmis sous forme d'objet", () => {
      const dto = build(CreateActivityDto, {
        type: ActivityType.PAUSE_COMPLETED,
        metadata: { exerciceId: 3, lineOrder: 1 },
      });
      expect(dto.metadata).toBe('{"exerciceId":3,"lineOrder":1}');
      expect(validateSync(dto)).toHaveLength(0);
    });

    it('laisse inchangé un metadata déjà sérialisé', () => {
      const dto = build(CreateActivityDto, {
        type: ActivityType.PAUSE_STARTED,
        metadata: '{}',
      });
      expect(dto.metadata).toBe('{}');
    });
  });

  describe('PainInputDto', () => {
    it('accepte `description` comme alias de `painDescription`', () => {
      const dto = build(PainInputDto, {
        painLocation: 'Abdos',
        painLevel: 5,
        description: 'douleur diffuse',
      });
      expect(dto.painDescription).toBe('douleur diffuse');
      expect(validateSync(dto)).toHaveLength(0);
    });

    it('reste valide sans description ni date', () => {
      const dto = build(PainInputDto, { painLocation: 'Abdos', painLevel: 3 });
      expect(validateSync(dto)).toHaveLength(0);
    });

    it('rejette une localisation inconnue et un niveau hors bornes', () => {
      const dto = build(PainInputDto, { painLocation: 'Nez', painLevel: 42 });
      expect(
        validateSync(dto)
          .map((e) => e.property)
          .sort(),
      ).toEqual(['painLevel', 'painLocation']);
    });
  });

  describe('CompletePractitionerProfileDto', () => {
    it('parse les tableaux JSON transmis en chaînes par expo-router', () => {
      const dto = build(CompletePractitionerProfileDto, {
        proSpecialities: '["dos","cervicales"]',
        diplomes:
          '[{"diplome":"Master","school":"Paris","country":"FR","year":2020}]',
        availabilities: '{"2027-01-01":["09:00"]}',
      });

      expect(dto.proSpecialities).toEqual(['dos', 'cervicales']);
      expect(dto.diplomes?.[0].diplome).toBe('Master');
      expect(dto.availabilities).toEqual({ '2027-01-01': ['09:00'] });
      expect(validateSync(dto)).toHaveLength(0);
    });

    it('rejette un JSON invalide au lieu de le laisser filer', () => {
      const dto = build(CompletePractitionerProfileDto, {
        proSpecialities: 'invalid json',
      });
      expect(validateSync(dto).map((e) => e.property)).toContain(
        'proSpecialities',
      );
    });
  });

  describe('RegisterPractitionerDto', () => {
    // Le parcours mobile n'envoie ni spécialités ni disponibilités à ce stade.
    it('reste valide avec le seul jeu de champs transmis par le client', () => {
      const dto = build(RegisterPractitionerDto, {
        userName: 'Dr Test',
        email: 'PRO@Test.com',
        password: 'password123',
        professionalType: ProfessionalType.KINESIOLOGUE,
        establishmentType: EstablishmentType.CANADIAN_HEALTH_FACILITY,
        postalCode: 'H1H1H1',
        phone: '514-000-0000',
        city: 'Montréal',
        country: 'Canada',
        licenseNumber: 'LIC-1',
        appointment: { startTime: '2027-01-10T09:00:00.000Z' },
      });

      expect(dto.email).toBe('pro@test.com');
      expect(validateSync(dto)).toHaveLength(0);
    });

    it('exige le créneau de rendez-vous', () => {
      const dto = build(RegisterPractitionerDto, {
        userName: 'Dr Test',
        email: 'pro@test.com',
        password: 'password123',
        professionalType: ProfessionalType.KINESIOLOGUE,
        establishmentType: EstablishmentType.CANADIAN_HEALTH_FACILITY,
        postalCode: 'H1H1H1',
      });
      expect(validateSync(dto).map((e) => e.property)).toContain('appointment');
    });
  });
});
