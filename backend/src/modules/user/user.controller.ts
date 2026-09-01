import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  ParseIntPipe,
  Delete,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { assertSelfOrAdmin } from '../../common/guards/ownership';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService,
  ) {}

  /* --------------------------------------------------------------- Public */

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    // SEC-03 : rôle imposé côté serveur. SEC-01 : le hash est retiré de la
    // réponse par @Exclude() + ClassSerializerInterceptor global.
    return this.userService.create(dto, UserRole.USER);
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException();
    return this.authService.login(user);
  }

  /* ------------------------------------------------- Compte de l'appelant */

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMe(@Req() req: AuthenticatedRequest) {
    return this.userService.findOne(req.user.userId);
  }

  /**
   * SEC-07 : conservée pour le client mobile déjà déployé, mais l'identifiant
   * d'URL doit désormais correspondre à celui du jeton — il ne sert plus à
   * désigner un profil arbitraire.
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/:id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    assertSelfOrAdmin(req.user, id);
    return this.userService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(req.user.userId, updateUserDto);
  }

  /** Alias de PATCH /user/me : le client mobile déployé émet un PUT. */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('me')
  replaceMe(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(req.user.userId, updateUserDto);
  }

  /** SEC-09 : seule voie de changement de mot de passe, avec re-vérification. */
  @ApiBearerAuth()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('me/password')
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.userService.changePassword(
      req.user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
    return { message: 'Mot de passe modifié, veuillez vous reconnecter' };
  }

  /* --------------------------------------------------- Réservé à l'admin */

  /**
   * SEC-01 : le listing complet des comptes (e-mails, rôles, données de santé)
   * était public. Il est désormais réservé aux administrateurs, et le hash du
   * mot de passe n'est plus sérialisable.
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  /**
   * SEC-07 : remplace l'ancien `GET /user/:id` qui lisait `@Param('email')` sur
   * une route `:id` — le paramètre valait toujours `undefined` et la requête
   * renvoyait le premier compte de la table.
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('by-email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  /* ------------------------------------------- Ressource ciblée par :id */

  /** SEC-02 : n'importe qui pouvait modifier n'importe quel compte. */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    assertSelfOrAdmin(req.user, id);
    return this.userService.update(id, updateUserDto);
  }

  /** SEC-07 : aucun contrôle de propriété sur les préférences de rappel. */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/settings')
  updateUserSetting(
    @Param('id', ParseIntPipe) id: number,
    @Body() settings: UpdateUserSettingsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    assertSelfOrAdmin(req.user, id);
    return this.userService.updateUserSetting(id, settings);
  }

  /** SEC-02 : n'importe qui pouvait supprimer n'importe quel compte. */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    assertSelfOrAdmin(req.user, id);
    return this.userService.remove(id);
  }
}
