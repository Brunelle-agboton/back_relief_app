import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
   let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

   it('should hash password and create user', async () => {
    const dto = { email: 'test@mail.com', password: 'pass', userName: 'test' } as any;
    const hashed = 'hashedpass';
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashed);
    repo.create.mockReturnValue({ ...dto, password: hashed });
    repo.save.mockResolvedValue({ ...dto, password: hashed });

    const result = await service.create(dto);

    expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
    expect(repo.create).toHaveBeenCalledWith({ ...dto, password: hashed });
    expect(repo.save).toHaveBeenCalledWith({ ...dto, password: hashed });
    expect(result.password).toBe(hashed);
  });

  it('should find user by email', async () => {
    const user = { id: 1, email: 'a@a.com' } as User;
    repo.findOne.mockResolvedValue(user);

    const result = await service.findByEmail('a@a.com');
    expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'a@a.com' } });
    expect(result).toBe(user);
  });

  it('should find user by id', async () => {
    const user = { id: 1, email: 'a@a.com' } as User;
    repo.findOne.mockResolvedValue(user);

    const result = await service.findOne(1);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(user);
  });

  it('should throw if user not found by id', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne(42)).rejects.toThrow('User with id 42 not found');
  });
  
});
