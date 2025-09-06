import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return a string', () => {
      const dto = new CreateNotificationDto();
      expect(service.create(dto)).toBe('This action adds a new notification');
    });
  });

  describe('findAll', () => {
    it('should return a string', () => {
      expect(service.findAll()).toBe('This action returns all notification');
    });
  });

  describe('findOne', () => {
    it('should return a string', () => {
      expect(service.findOne(1)).toBe('This action returns a #1 notification');
    });
  });

  describe('update', () => {
    it('should return a string', () => {
      const dto = new UpdateNotificationDto();
      expect(service.update(1, dto)).toBe('This action updates a #1 notification');
    });
  });

  describe('remove', () => {
    it('should return a string', () => {
      expect(service.remove(1)).toBe('This action removes a #1 notification');
    });
  });
});