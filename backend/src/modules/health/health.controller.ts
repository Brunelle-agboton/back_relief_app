import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request  } from '@nestjs/common';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PainInputDto } from './dto/pain-input.dto';
import { UserService } from '../user/user.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('pain-options')
  getPainOptions() {
    return this.healthService.getPainOptions();
  }

  @UseGuards(JwtAuthGuard)
  @Post('pain')
  async submitPain(@Request() req, @Body() dto: PainInputDto) {
    
    const userId = req.user.userId; 
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.healthService.submitPain({...dto, user});
  }

  @UseGuards(JwtAuthGuard)
  @Get('pains-latest')
    async getPainsLatest(@Request() req) {
        const userId = req.user.userId; 
        
        const user = await this.userService.findOne(userId);
        if (!user) {
          throw new Error('User not found');
        }
        return await this.healthService.getPainsLatest(user);
  }

  @Get()
  findAll() {
    return this.healthService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHealthDto: PainInputDto) {
    return this.healthService.update(+id, updateHealthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthService.remove(+id);
  }
}
