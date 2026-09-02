import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { configService } from '../config/config.service';

/**
 * DEP-01 : source de données dédiée à la CLI TypeORM (génération et exécution
 * des migrations).
 *
 * La configuration précédente ne pouvait pas fonctionner en production :
 * `synchronize` était désactivé, `migrationsRun` absent, et le chemin
 * `src/migration/*.ts` pointait vers un dossier inexistant — introuvable de
 * surcroît depuis le build compilé. Résultat : le schéma n'était jamais créé.
 *
 * Le chemin ci-dessous résout indifféremment les `.ts` (dev, via ts-node) et
 * les `.js` (production, depuis dist/).
 */
const AppDataSource = new DataSource({
  ...(configService.getTypeOrmConfig() as object),
  // La CLI ne doit jamais réécrire le schéma implicitement.
  synchronize: false,
  migrationsTableName: 'migrations',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
} as never);

// La CLI TypeORM exige un export unique de DataSource depuis ce fichier.
export default AppDataSource;
