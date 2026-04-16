import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        role: string;
    };
};

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.slice(7);
        const payload = verifyAccessToken(token);
        req.user = {
            userId: payload.userId,
            role: payload.role,
        };
        
        next();

    } catch {
    return res.status(401).json({ message: 'Invalid token' });
    }
}