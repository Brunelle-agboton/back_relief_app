import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from './common/enums/user-role.enum';

/**
 * Seed de DÉVELOPPEMENT uniquement — n'est appelé que si `SEED_ON_BOOT` est
 * actif (faux par défaut en production, cf. ConfigService.isSeedEnabled).
 *
 * SEC-09 : la version précédente insérait le praticien avec un mot de passe en
 * clair (`Password100`), ce qui rendait le compte inutilisable une fois
 * bcrypt.compare appliqué, et avec une adresse e-mail personnelle réelle
 * codée en dur. Les identifiants proviennent désormais de l'environnement et le
 * mot de passe est haché comme n'importe quel autre compte.
 */
export async function runSeed(dataSource: DataSource) {
  const email = process.env.SEED_PRACTITIONER_EMAIL;
  const password = process.env.SEED_PRACTITIONER_PASSWORD;
  const userName = process.env.SEED_PRACTITIONER_NAME || 'Praticien Démo';

  if (!email || !password) {
    console.log(
      'Seed praticien ignoré : SEED_PRACTITIONER_EMAIL / SEED_PRACTITIONER_PASSWORD non définis.',
    );
    return;
  }

  const existing = await dataSource.query(
    `SELECT id FROM "user" WHERE email = $1 LIMIT 1;`,
    [email.toLowerCase()],
  );
  if (existing.length > 0) {
    console.log('Seed praticien ignoré : le compte existe déjà.');
    return;
  }

  console.log('Running initial seed...');

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await dataSource.query(
    `INSERT INTO "user" ("userName", "email", "password", "role")
     VALUES ($1, $2, $3, $4)
     RETURNING id;`,
    [userName, email.toLowerCase(), passwordHash, UserRole.PRACTITIONER],
  );

  const [profile] = await dataSource.query(
    `INSERT INTO practitioner_profile (
       "professionalType", "postalCode", "establishmentType",
       "timezone", "teleconsultEnabled", "isActive", "user_id"
     )
     VALUES ('kinesiologue', 'GH0H0', 'Établissement de santé canadien',
             'America/Montreal', true, true, $1)
     RETURNING id;`,
    [user.id],
  );

  // Créneaux relatifs à la date du jour, pour rester réservables au fil du temps.
  const slots = [7, 8, 14].map((daysFromNow) => {
    const start = new Date();
    start.setDate(start.getDate() + daysFromNow);
    start.setHours(15, 0, 0, 0);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    return [start.toISOString(), end.toISOString()];
  });

  for (const [startTime, endTime] of slots) {
    await dataSource.query(
      `INSERT INTO availabilities (
         "startTime", "endTime", "timezone", "is_recurring",
         "rrule", "note", "isBooked", "practitioner_profile_id"
       )
       VALUES ($1, $2, 'America/Montreal', false, NULL, 'Consultation à Québec', false, $3);`,
      [startTime, endTime, profile.id],
    );
  }

  console.log('Seed completed ✔️');
}
