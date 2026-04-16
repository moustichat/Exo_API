import type { Request, Response, NextFunction } from 'express';
export type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        role: string;
    };
};
export declare function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map