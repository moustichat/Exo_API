import { verifyAccessToken } from '../utils/jwt';
export function authMiddleware(req, res, next) {
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
    }
    catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
//# sourceMappingURL=auth.middleware.js.map