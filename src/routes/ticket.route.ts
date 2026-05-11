import { Router, type Response, type NextFunction } from 'express';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateBody, validateParams } from '../middleware/validate.middleware';
import { ticketDeleteSchema, ticketIdParamsSchema, ticketPurchaseSchema } from '../verif';
import { ticketService } from '../services/ticket.service';

const router = Router();

router.use(authMiddleware);

router.post('/', validateBody(ticketPurchaseSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
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

router.delete('/:id', validateParams(ticketIdParamsSchema), validateBody(ticketDeleteSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };
        const { quantity } = req.body as { quantity: number };

        const result = await ticketService.removeTicketQuantity({
            userId: req.user!.userId,
            ticketId: Number(id),
            quantity,
        });

        res.status(200).json({
            success: true,
            data: {
                ...result,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;