import { Injectable } from '@nestjs/common';
import { InjectRepository }   from '@nestjs/typeorm';
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

  async log(dto: CreateActivityDto): Promise<Activity> {
    const act = this.repo.create(dto );
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

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
