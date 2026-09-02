import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtPayload, TokenType } from './jwt.constants';
import {
  UUID_A,
  UUID_B,
  UUID_C,
  UUID_D,
  UUID_E,
  UUID_MISSING,
} from '../../common/testing/uuid.fixtures';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockUserService = {
    findAuthContext: jest.fn(),
  };

  const payload = (overrides: Partial<JwtPayload> = {}): JwtPayload => ({
    sub: UUID_D,
    email: 'user@test.com',
    role: UserRole.USER,
    tv: 0,
    typ: TokenType.ACCESS,
    ...overrides,
  });

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    strategy = new JwtStrategy(mockUserService as unknown as UserService);
  });

  beforeEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('exige JWT_SECRET : aucun secret de repli en dur (SEC-08)', () => {
    const saved = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    expect(
      () => new JwtStrategy(mockUserService as unknown as UserService),
    ).toThrow(/JWT_SECRET/);
    process.env.JWT_SECRET = saved;
  });

  describe('validate', () => {
    it("propage le rôle jusqu'à request.user (SEC-08)", async () => {
      mockUserService.findAuthContext.mockResolvedValue({
        id: 42,
        email: 'user@test.com',
        role: UserRole.PRACTITIONER,
        tokenVersion: 0,
      });

      const result = await strategy.validate(
        payload({ role: UserRole.PRACTITIONER }),
      );

      expect(result).toEqual({
        userId: 42,
        email: 'user@test.com',
        role: UserRole.PRACTITIONER,
      });
    });

    it('refuse un refresh token présenté comme access token', async () => {
      await expect(
        strategy.validate(payload({ typ: TokenType.REFRESH })),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockUserService.findAuthContext).not.toHaveBeenCalled();
    });

    it('refuse un jeton dont le compte a été supprimé', async () => {
      mockUserService.findAuthContext.mockResolvedValue(null);
      await expect(strategy.validate(payload())).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('refuse un jeton révoqué (tokenVersion incrémentée)', async () => {
      mockUserService.findAuthContext.mockResolvedValue({
        id: 42,
        email: 'user@test.com',
        role: UserRole.USER,
        tokenVersion: 1,
      });
      await expect(strategy.validate(payload({ tv: 0 }))).rejects.toThrow(
        'Jeton révoqué',
      );
    });

    it('relit le rôle en base plutôt que de croire le jeton sur parole', async () => {
      mockUserService.findAuthContext.mockResolvedValue({
        id: 42,
        email: 'user@test.com',
        role: UserRole.USER,
        tokenVersion: 0,
      });

      const result = await strategy.validate(payload({ role: UserRole.ADMIN }));

      expect(result.role).toBe(UserRole.USER);
    });
  });
});
