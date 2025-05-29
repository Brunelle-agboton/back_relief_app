import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { seedRestExercise } from './seed';
import { Exercise } from './modules/exercise/entities/exercise.entity';
import { Program } from './modules/program/entities/program.entity';
import { ProgramLine } from './modules/program-line/entities/program-line.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });

  const dataSource = app.get(DataSource);
  try {
     // Vérification si les données ont déjà été seed
     const ExerciseRepository = dataSource.getRepository(Exercise);
    const ProgramRepository = dataSource.getRepository(Program);
    const ProgramLineRepository = dataSource.getRepository(ProgramLine);

    const existingData = await ExerciseRepository.count();
    if (existingData === 0) {
      console.log('Seeding database...');
      await seedRestExercise(dataSource);
      console.log('Seeding completed.');
    } else {
      console.log('Database already seeded. Skipping seed.');
    }
  } catch (error) {
    console.error('failed', error);
  }
  
  const config = new DocumentBuilder()
    .setTitle('Health Tracker API')
    .setDescription('API for health tracking app')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
