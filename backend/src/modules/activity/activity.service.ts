import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private repo: Repository<Activity>,
  ) {}

  /** L'utilisateur provient du jeton, jamais du corps de requête (SEC-05). */
  async log(dto: CreateActivityDto, user: User): Promise<Activity> {
    const act = this.repo.create({ ...dto, user });
    return this.repo.save(act);
  }

  async findByUser(userId: number): Promise<Activity[]> {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Activity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  /** SEC-07 : une activité ne peut être supprimée que par son propriétaire. */
  async remove(
    id: number,
    requesterId: number,
    requesterIsAdmin = false,
  ): Promise<void> {
    const activity = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!activity) {
      throw new NotFoundException(`Activity #${id} not found`);
    }
    if (!requesterIsAdmin && activity.user?.id !== requesterId) {
      throw new ForbiddenException('Accès limité à vos propres données');
    }
    await this.repo.delete(id);
  }
}
