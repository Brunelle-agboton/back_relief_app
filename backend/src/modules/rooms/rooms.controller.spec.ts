import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';

describe('RoomsController', () => {
  let controller: RoomsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RoomsController>(RoomsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('retourne le roomId fourni avec l\'userId du créateur', () => {
      const req = { user: { userId: 42 } } as unknown as AuthenticatedRequest;
      const result = controller.create(req, { roomId: 'room-abc' });
      expect(result).toEqual({ roomId: 'room-abc', createdBy: 42 });
    });

    it('génère un roomId si non fourni', () => {
      const req = { user: { userId: 7 } } as unknown as AuthenticatedRequest;
      const result = controller.create(req, {});
      expect(result.roomId).toMatch(/^room-\d+$/);
      expect(result.createdBy).toBe(7);
    });
  });

  describe('findOne', () => {
    it('retourne les métadonnées de la room', () => {
      const result = controller.findOne('room-xyz');
      expect(result).toEqual({ roomId: 'room-xyz' });
    });
  });
});
