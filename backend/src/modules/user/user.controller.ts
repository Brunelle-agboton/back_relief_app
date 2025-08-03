import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UnauthorizedException,UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException();
    return this.authService.login(user);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/:id')
  findById(@Param('id') id: number) {
    return this.userService.findOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }
  
  @UseGuards(JwtAuthGuard)
   @Patch(':id/settings')
  updateUserSetting(@Param('id') id: string, @Body() {restReminder, drinkReminder}) {
    return this.userService.updateUserSetting(+id, restReminder, drinkReminder);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
