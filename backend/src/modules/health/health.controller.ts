import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PainInputDto } from './dto/pain-input.dto';
import { HydrationInputDto } from './dto/hydration-input.dto';
import { UserService } from '../user/user.service';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';

/**
 * Données de santé au sens de l'article 9 du RGPD : toutes les routes exigent
 * une authentification et ne portent que sur l'utilisateur du jeton.
 *
 * SEC-04 : les routes de scaffolding `GET /health`, `GET /health/:id`,
 * `PATCH /health/:id` et `DELETE /health/:id` ont été supprimées. Elles
 * n'implémentaient rien (elles renvoyaient des chaînes littérales), n'étaient
 * protégées par aucun guard, et `GET /health` entrait en conflit avec la sonde
 * de disponibilité déclarée dans AppController. Le conflit de route est donc
 * levé : `GET /health` désigne sans ambiguïté la sonde.
 */
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly userService: UserService,
  ) {}

  @Get('pain-options')
  getPainOptions() {
    return this.healthService.getPainOptions();
  }

  @Post('pain')
  async submitPain(
    @Req() req: AuthenticatedRequest,
    @Body() dto: PainInputDto,
  ) {
    const user = await this.userService.findOne(req.user.userId);
    return this.healthService.submitPain(dto, user);
  }

  @Get('pains-latest')
  async getPainsLatest(@Req() req: AuthenticatedRequest) {
    const user = await this.userService.findOne(req.user.userId);
    return this.healthService.getPainsLatest(user);
  }

  @Post('hydration')
  async setHydratation(
    @Req() req: AuthenticatedRequest,
    @Body() dto: HydrationInputDto,
  ) {
    const user = await this.userService.findOne(req.user.userId);
    return this.healthService.setHydratation(dto.size, user);
  }

  @Get('hydration-latest')
  async latestHydratation(@Req() req: AuthenticatedRequest) {
    const user = await this.userService.findOne(req.user.userId);
    return this.healthService.latestHydratation(user);
  }
}
