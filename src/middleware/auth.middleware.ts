import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { bearerTokenSchema, jwtPayloadSchema } from '../verif';

type UserRole = 'USER' | 'ORGANIZER' | 'ADMIN';

export type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        role: UserRole;
    };
};

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const rawAuthHeader = req.headers.authorization;
        const authHeader = rawAuthHeader ? bearerTokenSchema.parse(rawAuthHeader) : undefined;
        const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
        const cookieToken = typeof req.cookies?.accessToken === 'string' ? req.cookies.accessToken : undefined;
        const token = headerToken ?? cookieToken;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const payload = jwtPayloadSchema.parse(verifyAccessToken(token));
        req.user = {
            userId: payload.userId,
            role: payload.role,
        };
        
        next();

    } catch {
    return res.status(401).json({ message: 'Invalid token' });
    }
}

export function requireRoles(...roles: UserRole[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
}

export function requireSelfOrRoles(...roles: UserRole[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const requestedUserId = req.params.id;
        const isSelf = requestedUserId === req.user.userId;
        const hasRole = roles.includes(req.user.role);

        if (!isSelf && !hasRole) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
}