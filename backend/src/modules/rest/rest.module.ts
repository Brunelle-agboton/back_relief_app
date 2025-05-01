import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestService } from './rest.service';
import { RestController } from './rest.controller';
import { Rest } from './entities/rest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rest]), 
  ],
  controllers: [RestController],
  providers: [RestService],
  exports: [RestService], // Export RestService if you want to use it in other modules
})
export class RestModule {}
