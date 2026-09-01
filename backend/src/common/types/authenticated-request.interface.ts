import { Request } from 'express';
import { UserRole } from '../enums/user-role.enum';

export interface AuthenticatedUser {
  userId: number;
  email: string;
  /** Propagé depuis le payload JWT et revalidé en base (cf. SEC-08). */
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
