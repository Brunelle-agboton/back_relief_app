import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { seedRest } from './modules/rest/seeds/rest.seed';
import { Rest } from './modules/rest/entities/rest.entity';

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
    const restRepository = dataSource.getRepository(Rest);
    const existingData = await restRepository.count();
    if (existingData === 0) {
      console.log('Seeding database...');
      await seedRest(dataSource);
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
