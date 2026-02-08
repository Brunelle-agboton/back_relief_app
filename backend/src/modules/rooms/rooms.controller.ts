import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  // MVP: pas de service DB, response minimal
  @Post()
  create(@Req() req: any, @Body() body: { roomId?: string }) {
    // tu peux générer un uuid côté serveur
    const roomId = body.roomId || `room-${Date.now()}`; 
    // ici -> sauvegarde en DB si besoin.
    return { roomId, createdBy: req.user.userId };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // si tu avais DB, retourne metadata; ici: minimal
    return { roomId: id };
  }
}
