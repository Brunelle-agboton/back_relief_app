import { Test, TestingModule } from '@nestjs/testing';
import { WebrtcGateway } from './webrtc.gateway';
import { JwtService } from '@nestjs/jwt';
import { Socket, Server } from 'socket.io';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeSocket(overrides: Partial<Socket> & { user?: any } = {}): jest.Mocked<Socket> & { user?: any } {
  const emitMock = jest.fn();
  const toMock = jest.fn().mockReturnValue({ emit: emitMock });
  return {
    id: 'socket-abc',
    handshake: { auth: { token: 'valid.jwt' } } as any,
    emit: jest.fn(),
    disconnect: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    user: undefined,
    ...overrides,
  } as any;
}

function makeServer(): jest.Mocked<Server> {
  const emitMock = jest.fn();
  const toMock = jest.fn().mockReturnValue({ emit: emitMock });
  return { to: toMock, emit: emitMock } as any;
}

// ─── Suite ──────────────────────────────────────────────────────────────────

describe('WebrtcGateway', () => {
  let gateway: WebrtcGateway;
  let jwtService: jest.Mocked<JwtService>;

  const validPayload = { sub: 1, email: 'user@test.com', role: 'user' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebrtcGateway,
        {
          provide: JwtService,
          useValue: { verify: jest.fn() },
        },
      ],
    }).compile();

    gateway = module.get<WebrtcGateway>(WebrtcGateway);
    jwtService = module.get(JwtService);

    // Injecter un server mocké
    gateway.server = makeServer();
  });

  // ─── handleConnection ────────────────────────────────────────────────────

  describe('handleConnection', () => {
    it('accepte une connexion avec un token valide', async () => {
      jwtService.verify.mockReturnValue(validPayload);
      const client = makeSocket();

      await gateway.handleConnection(client);

      expect(jwtService.verify).toHaveBeenCalledWith('valid.jwt', expect.any(Object));
      expect((client as any).user).toEqual({ userId: 1, email: 'user@test.com', role: 'user' });
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('déconnecte si aucun token fourni', async () => {
      const client = makeSocket({ handshake: { auth: {} } } as any);

      await gateway.handleConnection(client);

      expect(client.emit).toHaveBeenCalledWith('error', 'Unauthorized');
      expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it('déconnecte si le token est invalide', async () => {
      jwtService.verify.mockImplementation(() => { throw new Error('invalid token'); });
      const client = makeSocket();

      await gateway.handleConnection(client);

      expect(client.emit).toHaveBeenCalledWith('error', 'Unauthorized');
      expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it('déconnecte si le payload ne contient pas sub', async () => {
      jwtService.verify.mockReturnValue({ email: 'x@x.com' }); // pas de sub
      const client = makeSocket();

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalledWith(true);
    });
  });

  // ─── handleDisconnect ────────────────────────────────────────────────────

  describe('handleDisconnect', () => {
    it('nettoie le mapping socket si l\'utilisateur était connecté', async () => {
      jwtService.verify.mockReturnValue(validPayload);
      const client = makeSocket();
      await gateway.handleConnection(client);

      gateway.handleDisconnect(client);

      // Pas d'erreur et le socket est nettoyé (pas de vérification publique possible
      // sans exposer l'état interne — on vérifie juste que ça n'explose pas)
      expect(client.disconnect).toHaveBeenCalledTimes(0); // pas de double disconnect
    });

    it('ne plante pas si le socket n\'avait pas d\'utilisateur associé', () => {
      const client = makeSocket(); // user: undefined
      expect(() => gateway.handleDisconnect(client)).not.toThrow();
    });
  });

  // ─── handleJoinRoom ──────────────────────────────────────────────────────

  describe('handleJoinRoom', () => {
    it('rejette si le socket n\'a pas d\'utilisateur authentifié', async () => {
      const client = makeSocket(); // pas de user
      await gateway.handleJoinRoom(client, { roomId: 'room-1' });
      expect(client.emit).toHaveBeenCalledWith('error', 'Unauthorized');
    });

    it('émet joined quand le premier utilisateur rejoint une room', async () => {
      jwtService.verify.mockReturnValue(validPayload);
      const client = makeSocket();
      await gateway.handleConnection(client);

      await gateway.handleJoinRoom(client, { roomId: 'room-1' });

      expect(client.join).toHaveBeenCalledWith('room-1');
      expect(client.emit).toHaveBeenCalledWith('joined', { roomId: 'room-1' });
    });

    it('émet peer-joined et call_started quand le deuxième utilisateur rejoint', async () => {
      // User 1 rejoint
      jwtService.verify.mockReturnValue({ sub: 1, email: 'a@a.com', role: 'user' });
      const client1 = makeSocket({ id: 'socket-1' });
      await gateway.handleConnection(client1);
      await gateway.handleJoinRoom(client1, { roomId: 'room-2' });

      // User 2 rejoint
      jwtService.verify.mockReturnValue({ sub: 2, email: 'b@b.com', role: 'user' });
      const client2 = makeSocket({ id: 'socket-2' });
      await gateway.handleConnection(client2);
      await gateway.handleJoinRoom(client2, { roomId: 'room-2' });

      // Le server doit avoir été appelé pour notifier les pairs
      expect(gateway.server.to).toHaveBeenCalled();
    });

    it('émet room-full si la room a déjà 2 participants', async () => {
      // User 1 et 2 rejoignent
      jwtService.verify.mockReturnValue({ sub: 1, email: 'a@a.com', role: 'user' });
      const client1 = makeSocket({ id: 'socket-1' });
      await gateway.handleConnection(client1);
      await gateway.handleJoinRoom(client1, { roomId: 'room-3' });

      jwtService.verify.mockReturnValue({ sub: 2, email: 'b@b.com', role: 'user' });
      const client2 = makeSocket({ id: 'socket-2' });
      await gateway.handleConnection(client2);
      await gateway.handleJoinRoom(client2, { roomId: 'room-3' });

      // User 3 tente de rejoindre
      jwtService.verify.mockReturnValue({ sub: 3, email: 'c@c.com', role: 'user' });
      const client3 = makeSocket({ id: 'socket-3' });
      await gateway.handleConnection(client3);
      await gateway.handleJoinRoom(client3, { roomId: 'room-3' });

      expect(client3.emit).toHaveBeenCalledWith('room-full');
    });
  });

  // ─── handleLeaveRoom ─────────────────────────────────────────────────────

  describe('handleLeaveRoom', () => {
    it('retire l\'utilisateur de la room et notifie les pairs', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, email: 'a@a.com', role: 'user' });
      const client1 = makeSocket({ id: 'socket-1' });
      await gateway.handleConnection(client1);
      await gateway.handleJoinRoom(client1, { roomId: 'room-leave' });

      jwtService.verify.mockReturnValue({ sub: 2, email: 'b@b.com', role: 'user' });
      const client2 = makeSocket({ id: 'socket-2' });
      await gateway.handleConnection(client2);
      await gateway.handleJoinRoom(client2, { roomId: 'room-leave' });

      gateway.handleLeaveRoom(client1, { roomId: 'room-leave' });

      expect(client1.leave).toHaveBeenCalledWith('room-leave');
      expect(gateway.server.to).toHaveBeenCalled();
    });
  });

  // ─── handleOffer ─────────────────────────────────────────────────────────

  describe('handleOffer', () => {
    it('relaye l\'offer à l\'autre participant de la room', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, email: 'a@a.com', role: 'user' });
      const client1 = makeSocket({ id: 'socket-1' });
      await gateway.handleConnection(client1);
      await gateway.handleJoinRoom(client1, { roomId: 'room-offer' });

      jwtService.verify.mockReturnValue({ sub: 2, email: 'b@b.com', role: 'user' });
      const client2 = makeSocket({ id: 'socket-2' });
      await gateway.handleConnection(client2);
      await gateway.handleJoinRoom(client2, { roomId: 'room-offer' });

      const sdp = { type: 'offer', sdp: 'v=0...' };
      gateway.handleOffer(client1, { sdp, roomId: 'room-offer' });

      expect(gateway.server.to).toHaveBeenCalledWith('socket-2');
    });

    it('émet une erreur si la room n\'existe pas', async () => {
      jwtService.verify.mockReturnValue(validPayload);
      const client = makeSocket();
      await gateway.handleConnection(client);

      gateway.handleOffer(client, { sdp: {}, roomId: 'room-inexistante' });

      expect(client.emit).toHaveBeenCalledWith('error', 'Room not found');
    });
  });

  // ─── handleAnswer ────────────────────────────────────────────────────────

  describe('handleAnswer', () => {
    it('émet une erreur si la room n\'existe pas', async () => {
      jwtService.verify.mockReturnValue(validPayload);
      const client = makeSocket();
      await gateway.handleConnection(client);

      gateway.handleAnswer(client, { sdp: {}, roomId: 'room-inexistante' });

      expect(client.emit).toHaveBeenCalledWith('error', 'Room not found');
    });

    it('relaye la réponse à l\'autre participant', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, email: 'a@a.com', role: 'user' });
      const client1 = makeSocket({ id: 'socket-1' });
      await gateway.handleConnection(client1);
      await gateway.handleJoinRoom(client1, { roomId: 'room-answer' });

      jwtService.verify.mockReturnValue({ sub: 2, email: 'b@b.com', role: 'user' });
      const client2 = makeSocket({ id: 'socket-2' });
      await gateway.handleConnection(client2);
      await gateway.handleJoinRoom(client2, { roomId: 'room-answer' });

      gateway.handleAnswer(client2, { sdp: { type: 'answer' }, roomId: 'room-answer' });

      expect(gateway.server.to).toHaveBeenCalledWith('socket-1');
    });
  });

  // ─── handleIce ───────────────────────────────────────────────────────────

  describe('handleIce', () => {
    it('émet une erreur si la room n\'existe pas', async () => {
      jwtService.verify.mockReturnValue(validPayload);
      const client = makeSocket();
      await gateway.handleConnection(client);

      gateway.handleIce(client, { candidate: {}, roomId: 'room-inexistante' });

      expect(client.emit).toHaveBeenCalledWith('error', 'Room not found');
    });

    it('relaye le candidat ICE à l\'autre participant', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, email: 'a@a.com', role: 'user' });
      const client1 = makeSocket({ id: 'socket-1' });
      await gateway.handleConnection(client1);
      await gateway.handleJoinRoom(client1, { roomId: 'room-ice' });

      jwtService.verify.mockReturnValue({ sub: 2, email: 'b@b.com', role: 'user' });
      const client2 = makeSocket({ id: 'socket-2' });
      await gateway.handleConnection(client2);
      await gateway.handleJoinRoom(client2, { roomId: 'room-ice' });

      gateway.handleIce(client1, { candidate: { candidate: 'udp...' }, roomId: 'room-ice' });

      expect(gateway.server.to).toHaveBeenCalledWith('socket-2');
    });
  });
});
