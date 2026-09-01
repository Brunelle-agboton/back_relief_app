import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { assertSelfOrAdmin, isAdmin } from '../../common/guards/ownership';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { UserService } from '../user/user.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity')
export class ActivityController {
  private readonly logger = new Logger('ActivityController');

  constructor(
    private readonly ActivityService: ActivityService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async logAction(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateActivityDto,
  ) {
    try {
      const user = await this.userService.findOne(req.user.userId);
      return await this.ActivityService.log(dto, user);
    } catch (error) {
      this.logger.error(
        `Failed to log activity: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('me')
  getMine(@Req() req: AuthenticatedRequest) {
    return this.ActivityService.findByUser(req.user.userId);
  }

  /**
   * SEC-04/07 : la route était authentifiée mais `findByUser(+id)` ignorait
   * `req.user` — l'historique d'activité de n'importe quel utilisateur était
   * lisible avec un jeton valide quelconque.
   */
  @Get(':id')
  getForUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    assertSelfOrAdmin(req.user, id);
    return this.ActivityService.findByUser(id);
  }

  /** SEC-04 : le listing global de l'activité de tous les utilisateurs était public. */
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.ActivityService.findAll();
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.ActivityService.remove(id, req.user.userId, isAdmin(req.user));
  }
}
