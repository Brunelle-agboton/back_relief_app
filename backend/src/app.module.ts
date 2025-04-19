import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './config/config.service';
import { DataSource } from 'typeorm';


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return configService.getTypeOrmConfig();
      },
    }),
    // Other modules can be imported here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
  }
}
