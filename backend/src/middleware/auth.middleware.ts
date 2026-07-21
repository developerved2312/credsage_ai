import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { ResponseUtil } from '../utils/response';
import { Logger } from '../utils/logger';
import { fromNodeHeaders } from 'better-auth/node';

const logger = new Logger('AuthMiddleware');

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
        emailVerified: boolean;
      };
      session?: {
        id: string;
        userId: string;
        expiresAt: Date;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using Better Auth
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return ResponseUtil.unauthorized(res, 'Authentication required') as any;
    }

    // Attach user and session to request
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? undefined,
      emailVerified: session.user.emailVerified,
    };

    req.session = {
      id: session.session.id,
      userId: session.session.userId,
      expiresAt: new Date(session.session.expiresAt),
    };

    logger.debug(`Authenticated user: ${req.user.email}`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return ResponseUtil.unauthorized(res, 'Invalid or expired session') as any;
  }
};

/**
 * Optional authentication - doesn't fail if no session
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? undefined,
        emailVerified: session.user.emailVerified,
      };

      req.session = {
        id: session.session.id,
        userId: session.session.userId,
        expiresAt: new Date(session.session.expiresAt),
      };
    }
  } catch (error) {
    logger.debug('Optional auth: No valid session');
  }
  next();
};

/**
 * Middleware to require email verification
 */
export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.emailVerified) {
    return ResponseUtil.forbidden(
      res,
      'Email verification required. Please verify your email address.'
    ) as any;
  }
  next();
};
