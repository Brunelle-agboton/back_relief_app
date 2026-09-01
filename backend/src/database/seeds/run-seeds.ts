import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Exercise } from '../../modules/exercise/entities/exercise.entity';
import { seedRestExercise } from './exercise.seed';
import { seedDemoPractitioner } from './practitioner.seed';

/**
 * Clé arbitraire mais stable, propre au seed de cette application.
 * Les verrous consultatifs PostgreSQL partagent un espace de noms global.
 */
const SEED_ADVISORY_LOCK_KEY = 8_142_003;

const logger = new Logger('Seed');

/**
 * MET-04 : exécution du seed au démarrage.
 *
 * Trois défauts sont corrigés par rapport à l'appel direct depuis bootstrap() :
 *
 *  1. le garde-fou `SELECT COUNT(*)` n'était pas atomique — avec plusieurs
 *     instances, toutes voyaient une base vide et semaient en parallèle. Un
 *     verrou consultatif PostgreSQL sérialise l'opération ; l'instance qui ne
 *     l'obtient pas passe son tour au lieu d'insérer en double ;
 *
 *  2. toute erreur était avalée par un `catch` qui journalisait « failed » et
 *     laissait le démarrage se poursuivre — l'application démarrait alors sur
 *     une base à moitié peuplée. L'erreur est désormais propagée ;
 *
 *  3. l'appelant garantit que cette fonction n'est jamais invoquée en
 *     production (SEED_ON_BOOT vaut false par défaut hors développement).
 */
export async function runSeeds(dataSource: DataSource): Promise<void> {
  const [{ locked }] = (await dataSource.query(
    'SELECT pg_try_advisory_lock($1) AS locked;',
    [SEED_ADVISORY_LOCK_KEY],
  )) as [{ locked: boolean }];

  if (!locked) {
    logger.log('Seed ignoré : une autre instance le réalise déjà.');
    return;
  }

  try {
    const exerciseCount = await dataSource.getRepository(Exercise).count();
    if (exerciseCount === 0) {
      logger.log("Seed du catalogue d'exercices…");
      await seedRestExercise(dataSource);
      logger.log("Catalogue d'exercices semé.");
    } else {
      logger.log("Catalogue d'exercices déjà présent.");
    }

    await seedDemoPractitioner(dataSource);
  } finally {
    await dataSource.query('SELECT pg_advisory_unlock($1);', [
      SEED_ADVISORY_LOCK_KEY,
    ]);
  }
}
