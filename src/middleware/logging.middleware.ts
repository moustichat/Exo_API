import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const datePart = new Date(startTime).toISOString().slice(0, 10);
    const randomPart = Math.random().toString(36).slice(2, 8);
    const requestType = req.originalUrl.split('/').filter(Boolean)[2] ?? 'req';
    const requestId = `${requestType}-${datePart}-${randomPart}`;

    // Log la requête entrante
    logger.info('Incoming request', {
        requestId,
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip,
    });

    // Intercept la réponse
    const originalSend = res.send;
    res.send = function (data: any) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        // Déterminer le niveau de log selon le status code
        const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

        logger[logLevel as keyof typeof logger]('Request completed', {
            requestId,
            method: req.method,
            path: req.path,
            statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
        });

        return originalSend.call(this, data);
    };

    next();
};
