import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { AuthenticatedUser } from '../../common/types/authenticated-request.interface';
import { getJwtSecret, JwtPayload, TokenType } from './jwt.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  /**
   * SEC-08 :
   *  - le claim `typ` empêche qu'un refresh token serve d'access token ;
   *  - le rôle est propagé jusqu'à `request.user`, ce qui rend enfin possible
   *    un contrôle d'autorisation côté API (il était auparavant perdu ici) ;
   *  - il est rechargé depuis la base plutôt que cru sur parole, de sorte
   *    qu'une rétrogradation ou une suppression de compte prenne effet
   *    immédiatement ;
   *  - `tv` est comparé à `tokenVersion` pour permettre la révocation.
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (payload?.typ !== TokenType.ACCESS) {
      throw new UnauthorizedException('Type de jeton invalide');
    }

    const user = await this.userService.findAuthContext(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Compte inexistant');
    }
    if ((payload.tv ?? 0) !== (user.tokenVersion ?? 0)) {
      throw new UnauthorizedException('Jeton révoqué');
    }

    return { userId: user.id, email: user.email, role: user.role };
  }
}
