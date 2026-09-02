import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * DEP-01 : schéma initial.
 *
 * Le dépôt ne disposait d'aucune migration : `synchronize` était désactivé en
 * production, `migrationsRun` absent et le chemin configuré pointait vers un
 * dossier inexistant. Le schéma n'y était donc jamais créé.
 *
 * Cette migration décrit le schéma complet, clés primaires en `uuid`. Elle est
 * strictement additive (aucun DROP) : appliquée sur une base qui contiendrait
 * déjà des tables, elle échoue franchement plutôt que de détruire des données.
 */

export class InitialSchema1788307243144 implements MigrationInterface {
  name = 'InitialSchema1788307243144';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // uuid_generate_v4() provient de l'extension uuid-ossp : `synchronize`
    // la créait implicitement, une migration doit le faire explicitement.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "pain_record" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "painLocation" character varying NOT NULL, "painLevel" integer NOT NULL, "painDescription" character varying(255), "recordedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_bd275b370be3f15d9a54a706c04" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "hydration_record" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bottleSize" character varying NOT NULL, "recordedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_917bc1249894b15d1f223cb056e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "userId" uuid, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."activity_type_enum" AS ENUM('pause_started', 'pause_completed', 'water_drunk')`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."activity_type_enum" NOT NULL, "metadata" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_24625a1d6b1b089c8ae206fe467" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "availabilities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startTime" TIMESTAMP WITH TIME ZONE NOT NULL, "endTime" TIMESTAMP WITH TIME ZONE NOT NULL, "timezone" character varying NOT NULL, "is_recurring" boolean NOT NULL DEFAULT false, "rrule" character varying, "note" text, "isBooked" boolean NOT NULL DEFAULT false, "practitioner_profile_id" uuid, CONSTRAINT "PK_9562bd8681d40361b1a124ea52c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_951bd56761c36bc0fa35f4cba6" ON "availabilities" ("practitioner_profile_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."appointments_status_enum" AS ENUM('confirmed', 'cancelled', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "start_at" TIMESTAMP WITH TIME ZONE NOT NULL, "end_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'confirmed', "meeting_url" character varying, "meeting_meta" jsonb, "notes" text, "cancellation_reason" text, "cancelled_byId" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "patient_id" uuid, "practitioner_id" uuid, "cancelled_by" uuid, CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3330f054416745deaa2cc13070" ON "appointments" ("patient_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "practitioner_diplome" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "diplome" character varying NOT NULL, "school" character varying NOT NULL, "country" character varying NOT NULL, "year" integer NOT NULL, "practitioner_profile_id" uuid, CONSTRAINT "PK_e3413f5eb34b2ffd667eae2f0c9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."practitioner_profile_professionaltype_enum" AS ENUM('kinesiologue', 'physiotherapist', 'Ergothérapeute', 'orthopedist', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."practitioner_profile_establishmenttype_enum" AS ENUM('Établissement de santé canadien', 'Établissement de santé français', 'Clinique privée')`,
    );
    await queryRunner.query(
      `CREATE TABLE "practitioner_profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "professionalType" "public"."practitioner_profile_professionaltype_enum" NOT NULL, "specialties" text array, "bio" text, "qualifications" text array, "licenseNumber" character varying, "phone" character varying, "postalCode" character varying NOT NULL, "city" character varying, "country" character varying, "clinicAddress" text, "establishmentType" "public"."practitioner_profile_establishmenttype_enum" NOT NULL DEFAULT 'Établissement de santé canadien', "timezone" character varying NOT NULL DEFAULT 'Europe/Paris', "teleconsultEnabled" boolean NOT NULL DEFAULT true, "isActive" boolean NOT NULL DEFAULT true, "rating" numeric(3,2), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "UQ_b4eccab4a6fcde0701a1f517698" UNIQUE ("licenseNumber"), CONSTRAINT "REL_03710b3f862d6679c8f147f233" UNIQUE ("user_id"), CONSTRAINT "PK_0350088841a284b47134d2bf2ee" PRIMARY KEY ("id")); COMMENT ON COLUMN "practitioner_profile"."establishmentType" IS 'Type d''établissement de santé'`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "tokenVersion" integer NOT NULL DEFAULT '0', "age" integer, "poids" integer, "taille" integer, "sexe" character varying, "hourSit" integer, "isExercise" boolean, "numberTraining" integer, "restReminder" boolean, "drinkReminder" boolean, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."exercise_category_enum" AS ENUM('debout', 'assis', 'mur')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."exercise_position_enum" AS ENUM('lombaires', 'épaules', 'bras', 'dos', 'cou', 'buste', 'pieds', 'visage')`,
    );
    await queryRunner.query(
      `CREATE TABLE "exercise" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "category" "public"."exercise_category_enum" NOT NULL, "position" "public"."exercise_position_enum", "image" character varying, CONSTRAINT "PK_a0f107e3a2ef2742c1e91d97c14" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "program" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "image" character varying NOT NULL, CONSTRAINT "PK_3bade5945afbafefdd26a3a29fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "program_line" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order" integer NOT NULL, "repetitions" integer, "duration" integer, "calories" integer, "programId" uuid, "exerciseId" uuid, CONSTRAINT "PK_de970cdb0dc1a9bdefe45929599" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "pain_record" ADD CONSTRAINT "FK_2e50921423e681c4e2956e4d39f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "hydration_record" ADD CONSTRAINT "FK_e093b813e2b790c875710de0be5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "availabilities" ADD CONSTRAINT "FK_951bd56761c36bc0fa35f4cba60" FOREIGN KEY ("practitioner_profile_id") REFERENCES "practitioner_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_3330f054416745deaa2cc130700" FOREIGN KEY ("patient_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_4fa766bb5981c57e19e9709cfb8" FOREIGN KEY ("practitioner_id") REFERENCES "practitioner_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_671b4499922315bccf6c4fa8c65" FOREIGN KEY ("cancelled_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "practitioner_diplome" ADD CONSTRAINT "FK_8b406c630e7dc4c423de721098b" FOREIGN KEY ("practitioner_profile_id") REFERENCES "practitioner_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "practitioner_profile" ADD CONSTRAINT "FK_03710b3f862d6679c8f147f233c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "program_line" ADD CONSTRAINT "FK_f82e0fbdc913324ecea83f539dd" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "program_line" ADD CONSTRAINT "FK_b59574616a952300c110d1c69bb" FOREIGN KEY ("exerciseId") REFERENCES "exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "program_line" DROP CONSTRAINT "FK_b59574616a952300c110d1c69bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "program_line" DROP CONSTRAINT "FK_f82e0fbdc913324ecea83f539dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "practitioner_profile" DROP CONSTRAINT "FK_03710b3f862d6679c8f147f233c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "practitioner_diplome" DROP CONSTRAINT "FK_8b406c630e7dc4c423de721098b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_671b4499922315bccf6c4fa8c65"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_4fa766bb5981c57e19e9709cfb8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_3330f054416745deaa2cc130700"`,
    );
    await queryRunner.query(
      `ALTER TABLE "availabilities" DROP CONSTRAINT "FK_951bd56761c36bc0fa35f4cba60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "hydration_record" DROP CONSTRAINT "FK_e093b813e2b790c875710de0be5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pain_record" DROP CONSTRAINT "FK_2e50921423e681c4e2956e4d39f"`,
    );
    await queryRunner.query(`DROP TABLE "program_line"`);
    await queryRunner.query(`DROP TABLE "program"`);
    await queryRunner.query(`DROP TABLE "exercise"`);
    await queryRunner.query(`DROP TYPE "public"."exercise_position_enum"`);
    await queryRunner.query(`DROP TYPE "public"."exercise_category_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "practitioner_profile"`);
    await queryRunner.query(
      `DROP TYPE "public"."practitioner_profile_establishmenttype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."practitioner_profile_professionaltype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "practitioner_diplome"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3330f054416745deaa2cc13070"`,
    );
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_951bd56761c36bc0fa35f4cba6"`,
    );
    await queryRunner.query(`DROP TABLE "availabilities"`);
    await queryRunner.query(`DROP TABLE "activity"`);
    await queryRunner.query(`DROP TYPE "public"."activity_type_enum"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TABLE "hydration_record"`);
    await queryRunner.query(`DROP TABLE "pain_record"`);
  }
}
