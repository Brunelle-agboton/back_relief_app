import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

type Presence = { userId: number; socketId: string; role?: string };

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' }, // adapte en prod
  namespace: '/webrtc',
})
export class WebrtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebrtcGateway.name);

  // simple in-memory stores
  private socketsByUser = new Map<number, string>(); // userId -> socketId
  private rooms = new Map<string, Set<number>>(); // roomId -> set(userId)

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // token attendu dans client.handshake.auth.token (socket.io recommended)
      const token = client.handshake.auth?.token as string;
      if (!token) throw new UnauthorizedException('No token');

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'secretKey',
      }) as any;

      const userId = payload.sub;
      if (!userId) throw new UnauthorizedException('Invalid token payload');

      // enregistrer mapping
      this.socketsByUser.set(userId, client.id);
      // stocker user info sur le socket pour usage futur
      (client as any).user = { userId, email: payload.email, role: payload.role };

      this.logger.log(`Socket connected: user ${userId} -> socket ${client.id}`);
    } catch (err) {
      this.logger.warn(`Unauthorized socket connection attempt: ${err?.message}`);
      client.emit('error', 'Unauthorized');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = (client as any).user;
    if (user?.userId) {
      this.socketsByUser.delete(user.userId);
      // remove from any rooms
      for (const [roomId, set] of this.rooms.entries()) {
        if (set.has(user.userId)) {
          set.delete(user.userId);
          // notify remaining peer
          for (const otherUserId of set) {
            const sockId = this.socketsByUser.get(otherUserId);
            if (sockId) this.server.to(sockId).emit('peer-left', { roomId, userId: user.userId });
          }
          if (set.size === 0) this.rooms.delete(roomId);
        }
      }
      this.logger.log(`Socket disconnected: user ${user.userId}`);
    }
  }

  /* ---------- Events ----------- */

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const user = (client as any).user;
    if (!user) return client.emit('error', 'Unauthorized');

    const { roomId } = payload;
    if (!roomId) return client.emit('error', 'roomId required');

    let set = this.rooms.get(roomId);
    if (!set) {
      set = new Set<number>();
      this.rooms.set(roomId, set);
    }

    if (set.size >= 2 && !set.has(user.userId)) {
      // MVP: limit 2 participants per room
      return client.emit('room-full');
    }

    set.add(user.userId);
    client.join(roomId);

    // inform peers
    for (const otherUserId of set) {
      if (otherUserId !== user.userId) {
        const otherSocket = this.socketsByUser.get(otherUserId);
        if (otherSocket) {
          this.server.to(otherSocket).emit('peer-joined', { roomId, userId: user.userId });
        }
      }
    }

    client.emit('joined', { roomId });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: { roomId: string }) {
    const user = (client as any).user;
    const { roomId } = payload;
    const set = this.rooms.get(roomId);
    if (!set || !set.has(user.userId)) return;

    set.delete(user.userId);
    client.leave(roomId);

    for (const otherUserId of set) {
      const otherSocket = this.socketsByUser.get(otherUserId);
      if (otherSocket) this.server.to(otherSocket).emit('peer-left', { roomId, userId: user.userId });
    }
    if (set.size === 0) this.rooms.delete(roomId);
  }

  // offer -> forward to target userId
  @SubscribeMessage('offer')
  handleOffer(@ConnectedSocket() client: Socket, @MessageBody() payload: { toUserId: number; sdp: any }) {
    const from = (client as any).user;
    const targetSock = this.socketsByUser.get(payload.toUserId);
    if (!targetSock) return client.emit('error', 'peer-offline');
    this.server.to(targetSock).emit('offer', { fromUserId: from.userId, sdp: payload.sdp });
  }

  @SubscribeMessage('answer')
  handleAnswer(@ConnectedSocket() client: Socket, @MessageBody() payload: { toUserId: number; sdp: any }) {
    const from = (client as any).user;
    const targetSock = this.socketsByUser.get(payload.toUserId);
    if (!targetSock) return client.emit('error', 'peer-offline');
    this.server.to(targetSock).emit('answer', { fromUserId: from.userId, sdp: payload.sdp });
  }

  @SubscribeMessage('ice-candidate')
  handleIce(@ConnectedSocket() client: Socket, @MessageBody() payload: { toUserId: number; candidate: any }) {
    const targetSock = this.socketsByUser.get(payload.toUserId);
    if (!targetSock) return client.emit('error', 'peer-offline');
    this.server.to(targetSock).emit('ice-candidate', { fromUserId: (client as any).user.userId, candidate: payload.candidate });
  }
}
