import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
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
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { User } from '../src/modules/user/entities/user.entity';
import { UserRole } from '../src/common/enums/user-role.enum';
import { TokenType } from '../src/modules/auth/jwt.constants';
import { UUID_A, UUID_B } from '../src/common/testing/uuid.fixtures';

const TEST_JWT_SECRET = 'e2e-test-secret';

describe('E2E — flux HTTP critiques', () => {
  let app: INestApplication<App>;

  const mockUserService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    findOne: jest.fn(),
    findAuthContext: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateUserSetting: jest.fn(),
    changePassword: jest.fn(),
    revokeTokens: jest.fn(),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    registerPractitioner: jest.fn(),
  };

  /** Jeton d'accès valide pour l'utilisateur 1 (SEC-08 : claims `tv` et `typ`). */
  const signAccessToken = async (
    overrides: Record<string, unknown> = {},
  ): Promise<string> => {
    const { JwtService } = await import('@nestjs/jwt');
    const jwtService = new JwtService({ secret: TEST_JWT_SECRET });
    return jwtService.sign({
      sub: UUID_A,
      email: 'a@a.com',
      role: UserRole.USER,
      tv: 0,
      typ: TokenType.ACCESS,
      ...overrides,
    });
  };

  beforeAll(async () => {
    process.env.MODE = 'DEV';
    process.env.JWT_SECRET = TEST_JWT_SECRET;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
      ],
      controllers: [AppController, UserController],
      providers: [
        AppService,
        JwtStrategy,
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Configuration identique à main.ts (SEC-05).
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Contexte d'authentification par défaut : utilisateur 1, jeton non révoqué.
    mockUserService.findAuthContext.mockResolvedValue({
      id: UUID_A,
      email: 'a@a.com',
      role: UserRole.USER,
      tokenVersion: 0,
    });
  });

  // ─── Health ─────────────────────────────────────────────────────────────────

  describe('GET /health', () => {
    it('retourne 200 avec status ok et un timestamp', async () => {
      const res = await request(app.getHttpServer()).get('/health').expect(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(new Date(res.body.timestamp).toISOString()).toBe(
        res.body.timestamp,
      );
    });
  });

  // ─── Authentification ────────────────────────────────────────────────────────

  describe('POST /user/login', () => {
    it('retourne 200 avec access_token pour des credentials valides', async () => {
      mockAuthService.validateUser.mockResolvedValue({
        id: UUID_A,
        email: 'a@a.com',
        role: 'user',
      });
      mockAuthService.login.mockResolvedValue({
        access_token: 'signed.jwt.token',
        refresh_token: 'signed.refresh.token',
        expires_in: '1h',
      });

      const res = await request(app.getHttpServer())
        .post('/user/login')
        .send({ email: 'a@a.com', password: 'password123' })
        .expect(200);

      expect(res.body).toHaveProperty('access_token');
      // SEC-08 : un refresh token est désormais délivré à la connexion.
      expect(res.body).toHaveProperty('refresh_token');
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        'a@a.com',
        'password123',
      );
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

  // ─── SEC-05 : validation et whitelist ───────────────────────────────────────

  describe('POST /user/register — validation globale', () => {
    it('retourne 400 si les contraintes du DTO ne sont pas respectées', async () => {
      await request(app.getHttpServer())
        .post('/user/register')
        .send({ userName: 'ab', email: 'pas-un-email', password: '123' })
        .expect(400);

      expect(mockUserService.create).not.toHaveBeenCalled();
    });

    it('retire les champs non déclarés du DTO (mass assignment)', async () => {
      mockUserService.create.mockResolvedValue({ id: UUID_A });

      await request(app.getHttpServer())
        .post('/user/register')
        .send({
          userName: 'Jean Test',
          email: 'jean@test.com',
          password: 'password123',
          tokenVersion: 99,
        })
        .expect(201);

      expect(mockUserService.create.mock.calls[0][0]).not.toHaveProperty(
        'tokenVersion',
      );
    });

    // SEC-03 : escalade de privilèges à l'inscription.
    it('ignore un rôle imposé par le client et crée un compte `user`', async () => {
      mockUserService.create.mockResolvedValue({ id: UUID_A });

      await request(app.getHttpServer())
        .post('/user/register')
        .send({
          userName: 'Jean Test',
          email: 'jean@test.com',
          password: 'password123',
          role: 'practitioner',
        })
        .expect(201);

      const [dto, role] = mockUserService.create.mock.calls[0];
      expect(dto).not.toHaveProperty('role');
      expect(role).toBe(UserRole.USER);
    });

    // SEC-01 : le hash bcrypt ne doit plus être sérialisé.
    it('ne renvoie jamais le hash du mot de passe', async () => {
      const created = Object.assign(new User(), {
        id: UUID_A,
        userName: 'Jean Test',
        email: 'jean@test.com',
        password: '$2b$10$hash',
        role: UserRole.USER,
        tokenVersion: 0,
      });
      mockUserService.create.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post('/user/register')
        .send({
          userName: 'Jean Test',
          email: 'jean@test.com',
          password: 'password123',
        })
        .expect(201);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).not.toHaveProperty('tokenVersion');
      expect(res.body).toHaveProperty('email', 'jean@test.com');
    });
  });

  // ─── SEC-01/02 : routes autrefois publiques ─────────────────────────────────

  describe('Routes utilisateur autrefois publiques', () => {
    it('GET /user exige désormais une authentification', async () => {
      await request(app.getHttpServer()).get('/user').expect(401);
      expect(mockUserService.findAll).not.toHaveBeenCalled();
    });

    it('PATCH /user/:id exige désormais une authentification', async () => {
      await request(app.getHttpServer())
        .patch(`/user/${UUID_A}`)
        .send({ userName: 'pirate' })
        .expect(401);
      expect(mockUserService.update).not.toHaveBeenCalled();
    });

    it('DELETE /user/:id exige désormais une authentification', async () => {
      await request(app.getHttpServer()).delete(`/user/${UUID_A}`).expect(401);
      expect(mockUserService.remove).not.toHaveBeenCalled();
    });
  });

  // ─── Protection des routes ───────────────────────────────────────────────────

  describe('Routes protégées par JwtAuthGuard', () => {
    it('retourne 401 sans token sur GET /user/me/:id', async () => {
      await request(app.getHttpServer()).get(`/user/me/${UUID_A}`).expect(401);
    });

    it('retourne 401 avec un token invalide sur GET /user/me/:id', async () => {
      await request(app.getHttpServer())
        .get(`/user/me/${UUID_A}`)
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('retourne 200 avec un token valide sur GET /user/me/:id', async () => {
      mockUserService.findOne.mockResolvedValue({
        id: UUID_A,
        email: 'a@a.com',
      });

      await request(app.getHttpServer())
        .get(`/user/me/${UUID_A}`)
        .set('Authorization', `Bearer ${await signAccessToken()}`)
        .expect(200);
    });

    // SEC-07 : l'identifiant d'URL ne désigne plus un profil arbitraire.
    it("retourne 403 sur le profil d'un autre utilisateur", async () => {
      await request(app.getHttpServer())
        .get(`/user/me/${UUID_B}`)
        .set('Authorization', `Bearer ${await signAccessToken()}`)
        .expect(403);

      expect(mockUserService.findOne).not.toHaveBeenCalled();
    });

    // SEC-02 : suppression d'un compte tiers.
    it("retourne 403 à la suppression du compte d'un tiers", async () => {
      await request(app.getHttpServer())
        .delete(`/user/${UUID_B}`)
        .set('Authorization', `Bearer ${await signAccessToken()}`)
        .expect(403);

      expect(mockUserService.remove).not.toHaveBeenCalled();
    });

    // Les identifiants sont des UUID : un `:id` numérique n'est plus une
    // ressource introuvable mais une requête malformée.
    it("retourne 400 sur un identifiant qui n'est pas un UUID", async () => {
      await request(app.getHttpServer())
        .get('/user/me/1')
        .set('Authorization', `Bearer ${await signAccessToken()}`)
        .expect(400);

      expect(mockUserService.findOne).not.toHaveBeenCalled();
    });

    // SEC-08 : un refresh token ne vaut pas access token.
    it('retourne 401 si un refresh token est présenté comme access token', async () => {
      await request(app.getHttpServer())
        .get(`/user/me/${UUID_A}`)
        .set(
          'Authorization',
          `Bearer ${await signAccessToken({ typ: TokenType.REFRESH })}`,
        )
        .expect(401);
    });

    // SEC-08 : révocation côté serveur.
    it('retourne 401 pour un jeton révoqué (tokenVersion incrémentée)', async () => {
      mockUserService.findAuthContext.mockResolvedValue({
        id: UUID_A,
        email: 'a@a.com',
        role: UserRole.USER,
        tokenVersion: 1,
      });

      await request(app.getHttpServer())
        .get(`/user/me/${UUID_A}`)
        .set('Authorization', `Bearer ${await signAccessToken({ tv: 0 })}`)
        .expect(401);
    });

    // SEC-08 : le rôle est nécessaire au contrôle d'autorisation.
    it('retourne 403 sur une route réservée aux administrateurs', async () => {
      await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${await signAccessToken()}`)
        .expect(403);

      expect(mockUserService.findAll).not.toHaveBeenCalled();
    });

    it('autorise un administrateur sur GET /user', async () => {
      mockUserService.findAuthContext.mockResolvedValue({
        id: UUID_A,
        email: 'admin@a.com',
        role: UserRole.ADMIN,
        tokenVersion: 0,
      });
      mockUserService.findAll.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/user')
        .set(
          'Authorization',
          `Bearer ${await signAccessToken({ role: UserRole.ADMIN })}`,
        )
        .expect(200);
    });
  });
});
