import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    strategy = new JwtStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('mappe le payload JWT en objet utilisateur', async () => {
      const payload = { sub: 42, email: 'user@test.com' };
      const result = await strategy.validate(payload);
      expect(result).toEqual({ userId: 42, email: 'user@test.com' });
    });

    it('retourne userId et email quel que soit le reste du payload', async () => {
      const payload = { sub: 1, email: 'a@b.com', role: 'practitioner', iat: 123456, exp: 999999 };
      const result = await strategy.validate(payload);
      expect(result).toEqual({ userId: 1, email: 'a@b.com' });
    });
  });
});
