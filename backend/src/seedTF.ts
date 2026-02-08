import { DataSource } from 'typeorm';

export async function runSeed(dataSource: DataSource) {
  console.log('Checking if initial seed is needed...');

  // Vérifie si un user existe déjà
  const userCount = await dataSource.query(`SELECT COUNT(*) FROM "user";`);
  
  if (parseInt(userCount[0].count) > 0) {
    console.log("Seed skipped: data already present.");
    return;
  }

  console.log("Running initial seed...");

  await dataSource.query(`
    INSERT INTO "user" ("userName", "email", "password", "role")
    VALUES ('Tantely Vicenzi', 'ftantely@gmail.com', 'Password100', 'practitioner');
  `);

  await dataSource.query(`
    INSERT INTO practitioner_profile (
      "professionalType",
      "postalCode",
      "establishmentType",
      "timezone",
      "teleconsultEnabled",
      "isActive",
      "user_id"
    )
    VALUES (
      'kinesiologue',
      'GH0H0',
      'Établissement de santé canadien',
      'America/Montreal',
      true,
      true,
      1
    );
  `);

  await dataSource.query(`
    INSERT INTO availabilities (
      "startTime",
      "endTime",
      "timezone",
      "is_recurring",
      "rrule",
      "note",
      "isBooked",
      "practitioner_profile_id"
    )
    VALUES 
      ('2025-12-12 15:00:00-05', '2025-12-12 15:30:00-05', 'America/Montreal', false, NULL, 'Consultation à Québec', false, 1),
      ('2025-12-12 15:00:00-05', '2025-12-12 15:30:00-05', 'America/Montreal', false, NULL, 'Consultation à Québec', false, 1),
      ('2025-12-12 15:00:00-05', '2025-12-12 15:30:00-05', 'America/Montreal', false, NULL, 'Consultation à Québec', false, 1);
  `);

  console.log("Seed completed ✔️");
}
