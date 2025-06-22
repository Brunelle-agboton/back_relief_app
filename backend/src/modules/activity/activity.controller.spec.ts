import { Test, TestingModule } from '@nestjs/testing';
import {ActivityController } from './activity.controller';
import {ActivityService } from './activity.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { UserService } from '../user/user.service';

describe('ActivityController', () => {
  let controller:ActivityController;
  let activityService: Partial<Record<keyof ActivityService, jest.Mock>>;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    // etc.
  };

  userService = {
      findOne: jest.fn(),
    };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [ActivityService, 
        {provide: getRepositoryToken(Activity),useValue: mockRepo,
        },
        { provide: UserService, useValue: userService },
],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
