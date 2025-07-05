import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SummaryService }                  from './summary.service';
import { JwtAuthGuard }                    from '../auth/jwt.guard';
import { UserService } from '../user/user.service';

@Controller('summary')
export class SummaryController {
  constructor(private summaryService: SummaryService,
        private readonly userService: UserService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  async getSummary(@Req() req) {
    const userId = req.user.userId; 
    
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const result = await this.summaryService.getSummaryForUser(user);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get("details")
  async getUserHealthDetails(@Req() req) {
    const userId = req.user.userId; 
    
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const result = await this.summaryService.getUserHealth(user);
    return result;

  }
}
