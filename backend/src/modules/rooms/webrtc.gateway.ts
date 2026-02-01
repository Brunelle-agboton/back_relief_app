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
  cors: { origin: '*' },
  namespace: '/webrtc',
})
export class WebrtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebrtcGateway.name);

  // simple in-memory stores
  private socketsByUser = new Map<number, string>(); // userId -> socketId
  private rooms = new Map<string, Set<number>>(); // roomId -> set(userId)
  private initiatorByRoom = new Map<string, number>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connecting: ${client.id}`);
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
    this.logger.log(`Client disconnecting: ${client.id}`);
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
  ) 
  {
    
    this.logger.log(`Received joinRoom event from socket ${client.id} for room ${payload.roomId}`);
    const user = (client as any).user;
    if (!user) {
      this.logger.warn(`Unauthorized joinRoom attempt from socket ${client.id}`);
      return client.emit('error', 'Unauthorized');
    }

    const existingSet = this.rooms.get(payload.roomId);

if (existingSet?.has(user.userId)) {
  this.logger.warn(`User ${user.userId} already joined room ${payload.roomId}`);
  return;
}

    const { roomId } = payload;
    if (!roomId) {
      this.logger.warn(`joinRoom event missing roomId from user ${user.userId}`);
      return client.emit('error', 'roomId required');
    }

    let set = this.rooms.get(roomId);
    if (set && set.has(user.userId)) {
    this.logger.warn(`User ${user.userId} already in room ${roomId}`);
      this.initiatorByRoom.set(roomId, user.userId);

    return;
}

    if (!set) {
      set = new Set<number>();
      this.rooms.set(roomId, set);
      this.logger.log(`Created new room: ${roomId}`);
    }

    if (set.size >= 2 && !set.has(user.userId)) {
      this.logger.warn(`Room ${roomId} is full. User ${user.userId} cannot join.`);
      return client.emit('room-full');
    }

    set.add(user.userId);
    client.join(roomId);
    this.logger.log(`User ${user.userId} joined room ${roomId}. Current participants: ${set.size}`);

    // inform peers
    for (const otherUserId of set) {
      if (otherUserId !== user.userId) {
        const otherSocket = this.socketsByUser.get(otherUserId);
        if (otherSocket) {
          this.server.to(otherSocket).emit('peer-joined', { roomId, userId: user.userId });
          this.logger.log(`Notified peer ${otherUserId} that user ${user.userId} joined room ${roomId}`);
        }
      }
    }

    client.emit('joined', { roomId });

    if (set.size === 2) {
      this.logger.log(`Room ${roomId} now has 2 participants. Designating an initiator.`);
      
      // Get user IDs from the room
      const userIds = Array.from(set);

      // Ensure we have an initiator id; fallback to the first participant and store it
      let initiatorId = this.initiatorByRoom.get(roomId) ?? userIds[0];
      this.initiatorByRoom.set(roomId, initiatorId);

      // The receiver is the other participant
      const receiverId = userIds.find((id) => id !== initiatorId)!;

      const initiatorSocketId = this.socketsByUser.get(initiatorId);
      const receiverSocketId = this.socketsByUser.get(receiverId);

      if (initiatorSocketId) {
        // Signal only the initiator to create the offer
        this.server.to(initiatorSocketId).emit('create_offer', { roomId });
        this.logger.log(`Emitted create_offer to initiator ${initiatorId}`);
      }

      // Notify both that the call can start, which triggers navigation
      if (initiatorSocketId) this.server.to(initiatorSocketId).emit('call_started', { roomId });
      if (receiverSocketId) this.server.to(receiverSocketId).emit('call_started', { roomId });
      this.logger.log(`Emitted call_started to both users in room ${roomId}`);
    }
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

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sdp: any; roomId: string },
  ) {
    const from = (client as any).user;
    const { sdp, roomId } = payload;
    const roomParticipants = this.rooms.get(roomId);

    if (!roomParticipants) {
      return client.emit('error', 'Room not found');
    }

    for (const participantId of roomParticipants) {
      if (participantId !== from.userId) {
        const targetSock = this.socketsByUser.get(participantId);
        if (targetSock) {
          this.server.to(targetSock).emit('offer', { fromUserId: from.userId, sdp, roomId });
        }
      }
    }
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sdp: any; roomId: string },
  ) {
    const from = (client as any).user;
    const { sdp, roomId } = payload;
    const roomParticipants = this.rooms.get(roomId);

    if (!roomParticipants) {
      return client.emit('error', 'Room not found');
    }

    for (const participantId of roomParticipants) {
      if (participantId !== from.userId) {
        const targetSock = this.socketsByUser.get(participantId);
        if (targetSock) {
          this.server.to(targetSock).emit('answer', { fromUserId: from.userId, sdp, roomId });
        }
      }
    }
  }

  @SubscribeMessage('ice_candidate')
  handleIce(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { candidate: any; roomId: string },
  ) {
    const from = (client as any).user;
    const { candidate, roomId } = payload;
    const roomParticipants = this.rooms.get(roomId);

    if (!roomParticipants) {
      return client.emit('error', 'Room not found');
    }

    for (const participantId of roomParticipants) {
      if (participantId !== from.userId) {
        const targetSock = this.socketsByUser.get(participantId);
        if (targetSock) {
          this.server.to(targetSock).emit('ice_candidate', { fromUserId: from.userId, candidate, roomId });
        }
      }
    }
  }

  @SubscribeMessage('webrtc_ready')
  handleWebRtcReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const from = (client as any).user;
    const { roomId } = payload;
    const roomParticipants = this.rooms.get(roomId);

    if (!roomParticipants) {
      return client.emit('error', 'Room not found');
    }

    // If there are two participants, and the other one is ready, 
    // the initiator should send the offer.
    if (roomParticipants.size === 2) {
      for (const participantId of roomParticipants) {
        if (participantId !== from.userId) {
          const targetSock = this.socketsByUser.get(participantId);
          if (targetSock) {
            // Signal the other participant to create an offer
            this.server.to(targetSock).emit('create_offer', { roomId });
          }
        }
      }
    }
  }
}
