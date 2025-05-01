import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });

  const dataSource = app.get(DataSource);
  try {
    await dataSource.initialize();
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed', error);
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
