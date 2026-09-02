import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  UUID_A,
  UUID_B,
  UUID_C,
  UUID_D,
  UUID_E,
  UUID_MISSING,
} from '../../common/testing/uuid.fixtures';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: Repository<Notification>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getRepositoryToken(Notification), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    repository = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée et sauvegarde une notification', async () => {
      const dto: CreateNotificationDto = {
        title: 'Rappel',
        description: "Buvez de l'eau",
        date: '2026-05-28T10:00:00.000Z',
        userId: UUID_A,
      };
      const notification = new Notification();
      mockRepository.create.mockReturnValue(notification);
      mockRepository.save.mockResolvedValue(notification);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        user: { id: dto.userId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(notification);
      expect(result).toEqual(notification);
    });
  });

  describe('findAll', () => {
    it('retourne toutes les notifications avec la relation user', async () => {
      const notifications = [new Notification(), new Notification()];
      mockRepository.find.mockResolvedValue(notifications);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['user'] });
      expect(result).toHaveLength(2);
    });
  });

  describe('findByUser', () => {
    it("retourne les notifications d'un utilisateur triées par date DESC", async () => {
      const notifications = [new Notification()];
      mockRepository.find.mockResolvedValue(notifications);

      const result = await service.findByUser(UUID_D);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { user: { id: UUID_D } },
        order: { date: 'DESC' },
      });
      expect(result).toEqual(notifications);
    });
  });

  describe('findOne', () => {
    it('retourne la notification correspondante', async () => {
      const notification = new Notification();
      mockRepository.findOne.mockResolvedValue(notification);

      const result = await service.findOne(UUID_A);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: UUID_A },
        relations: ['user'],
      });
      expect(result).toEqual(notification);
    });

    it('lève NotFoundException si non trouvée', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(UUID_MISSING)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('met à jour et sauvegarde la notification', async () => {
      const notification = Object.assign(new Notification(), {
        title: 'Ancien titre',
      });
      mockRepository.findOne.mockResolvedValue(notification);
      mockRepository.save.mockResolvedValue({
        ...notification,
        title: 'Nouveau titre',
      });

      const result = await service.update(UUID_A, { title: 'Nouveau titre' });

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('Nouveau titre');
    });

    it('lève NotFoundException si non trouvée', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(
        service.update(UUID_MISSING, { title: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsRead', () => {
    it('passe isRead à true et sauvegarde', async () => {
      const notification = Object.assign(new Notification(), { isRead: false });
      mockRepository.findOne.mockResolvedValue(notification);
      mockRepository.save.mockResolvedValue({ ...notification, isRead: true });

      const result = await service.markAsRead(UUID_A);

      expect(notification.isRead).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(notification);
      expect(result.isRead).toBe(true);
    });
  });

  describe('remove', () => {
    it('supprime la notification', async () => {
      const notification = new Notification();
      mockRepository.findOne.mockResolvedValue(notification);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(UUID_A);

      expect(mockRepository.remove).toHaveBeenCalledWith(notification);
    });

    it('lève NotFoundException si non trouvée', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(UUID_MISSING)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
