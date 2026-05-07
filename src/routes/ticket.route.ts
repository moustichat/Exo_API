import { Router, type Response, type NextFunction } from 'express';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { ticketPurchaseSchema } from '../verif';
import { ticketService } from '../services/ticket.service';

const router = Router();

router.use(authMiddleware);

router.post('/', validateBody(ticketPurchaseSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        console.log('[ROUTE] POST /tickets received');
        console.log('[ROUTE] User:', req.user);
        console.log('[ROUTE] Body:', req.body);
        
        const { eventId, quantity } = req.body as { eventId: string; quantity: number };

        const ticket = await ticketService.purchaseTicket({
            userId: req.user!.userId,
            eventId,
            quantity,
        });

        res.status(201).json({
            success: true,
            data: {
                ticket,
            },
        });
    } catch (error) {
        console.log('[ROUTE] Error caught:', error);
        next(error);
    }
});

router.get('/me', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const tickets = await ticketService.getMyTickets(req.user!.userId);

        res.status(200).json({
            success: true,
            data: {
                tickets,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;