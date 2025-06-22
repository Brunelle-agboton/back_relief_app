import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Logger   } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard }  from '../auth/jwt.guard';


import { UserService } from '../user/user.service';

@Controller('activity')
export class ActivityController {
  private readonly  logger = new Logger('ActivityController');

  constructor(private readonly ActivityService: ActivityService, private readonly userService: UserService,) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async logAction(@Req() req, @Body() dto: CreateActivityDto) {
     try {
        const userId = req.user.userId; 
        
      // this.logger.log(`Received activity log for user: ${userId}`);
      // this.logger.debug(`Activity data: ${JSON.stringify(dto)}`);

        const user = await this.userService.findOne(userId);
        if (!user) {
          throw new Error('User not found');
        }
        const res =  this.ActivityService.log({...dto, user});
      //this.logger.log(`Activity logged successfully for user: ${userId}`);
        return res;
    } catch (error) {
      this.logger.error(`Failed to log activity: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getForUser(@Param('id') id: string, @Req() req) {
    return this.ActivityService.findByUser(+id);
  }

  @Get()
  findAll() {
    return this.ActivityService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    return this.ActivityService.update(+id, updateActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ActivityService.remove(+id);
  }
}
