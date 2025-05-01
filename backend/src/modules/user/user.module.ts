import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Assuming User is the entity you want to use
    forwardRef(() => AuthModule), // Import AuthModule to use AuthService
  ],
  controllers: [UserController],
  providers: [UserService], // Provide UserService and AuthService
  exports: [UserService], // Export UserService if you want to use it in other modules
})
export class UserModule {}
