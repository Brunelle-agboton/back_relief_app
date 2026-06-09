import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { UserController } from '../src/modules/user/user.controller';
import { UserService } from '../src/modules/user/user.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../src/modules/auth/jwt.strategy';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

const TEST_JWT_SECRET = 'e2e-test-secret';

describe('E2E — flux HTTP critiques', () => {
  let app: INestApplication<App>;

  const mockUserService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateUserSetting: jest.fn(),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    registerPractitioner: jest.fn(),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({ secret: TEST_JWT_SECRET, signOptions: { expiresIn: '1h' } }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
      ],
      controllers: [AppController, UserController],
      providers: [
        AppService,
        JwtStrategy,
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Health ─────────────────────────────────────────────────────────────────

  describe('GET /health', () => {
    it('retourne 200 avec status ok et un timestamp', async () => {
      const res = await request(app.getHttpServer()).get('/health').expect(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
    });
  });

  // ─── Authentification ────────────────────────────────────────────────────────

  describe('POST /user/login', () => {
    it('retourne 200 avec access_token pour des credentials valides', async () => {
      mockAuthService.validateUser.mockResolvedValue({ id: 1, email: 'a@a.com', role: 'user' });
      mockAuthService.login.mockResolvedValue({ access_token: 'signed.jwt.token' });

      const res = await request(app.getHttpServer())
        .post('/user/login')
        .send({ email: 'a@a.com', password: 'password123' })
        .expect(200);

      expect(res.body).toHaveProperty('access_token');
      expect(mockAuthService.validateUser).toHaveBeenCalledWith('a@a.com', 'password123');
    });

    it('retourne 401 pour un mauvais mot de passe', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/user/login')
        .send({ email: 'a@a.com', password: 'wrong' })
        .expect(401);
    });

    it('retourne 400 si le body est invalide (email manquant)', async () => {
      await request(app.getHttpServer())
        .post('/user/login')
        .send({ password: 'password123' })
        .expect(400);
    });
  });

  // ─── Protection des routes ───────────────────────────────────────────────────

  describe('Routes protégées par JwtAuthGuard', () => {
    it('retourne 401 sans token sur GET /user/me/:id', async () => {
      await request(app.getHttpServer())
        .get('/user/me/1')
        .expect(401);
    });

    it('retourne 401 avec un token invalide sur GET /user/me/:id', async () => {
      await request(app.getHttpServer())
        .get('/user/me/1')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('retourne 200 avec un token valide sur GET /user/me/:id', async () => {
      const { JwtService } = await import('@nestjs/jwt');
      const jwtService = new JwtService({ secret: TEST_JWT_SECRET });
      const token = jwtService.sign({ sub: 1, email: 'a@a.com', role: 'user' });

      mockUserService.findOne.mockResolvedValue({ id: 1, email: 'a@a.com' });

      await request(app.getHttpServer())
        .get('/user/me/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
