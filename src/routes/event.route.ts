import { Router, type Request, type Response } from "express";
import { prisma } from "./../lib/prisma";
import { logger } from "../lib/logger";
import {
    eventCreateSchema,
    eventIdParamsSchema,
    eventUpdateSchema,
} from "../verif";
import { validateBody, validateParams } from "../middleware/validate.middleware";
import { authMiddleware, requireRoles, type AuthenticatedRequest } from "../middleware/auth.middleware";


const router = Router();



// GET /api/events - retourne uniquement les événements non supprimés (pour la recherche publique)
router.get('/', async (req: Request, res: Response) => {
    const events = await prisma.event.findMany({
        where: { isDeleted: false }
    });
    res.status(200).json({
        success: true,
        data: {
            events,
        },
    });
});





// GET /api/events/my-events - retourne les événements de l'organisateur connecté, incluant les supprimés
router.get('/my-events', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const events = await prisma.event.findMany({
        where: { organizerId: req.user!.userId },
        include: {
            tickets: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    purchaseDate: 'desc',
                },
            },
        },
        orderBy: {
            date: 'asc',
        },
    });
    res.status(200).json({
        success: true,
        data: {
            events,
        },
    });
});



// Get /api/todos/:id
// :id est un parametre de route 
// il sera accessible dans l'objet req.params
router.get('/:id', validateParams(eventIdParamsSchema), async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const event = await prisma.event.findUniqueOrThrow({ where: { id } });
    res.status(200).json({
        success: true,
        data: {
            event,
        },
    });
});



// POST /api/events
router.post('/', authMiddleware, requireRoles('ORGANIZER', 'ADMIN'), validateBody(eventCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
    const event = await prisma.event.create({
        data: {
            ...req.body,
            organizerId: req.user!.userId,
        }
    });

    logger.info('Event created', { eventId: event.id, organizerId: event.organizerId });

    res.status(201).json({
        success: true,
        data: {
            event,
        },
    });
});



// PATCH /api/events/:id
router.patch('/:id', authMiddleware, requireRoles('ORGANIZER', 'ADMIN'), validateParams(eventIdParamsSchema), validateBody(eventUpdateSchema), async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const event = await prisma.event.update({
        where: { id },
        data: req.body
    })

    logger.info('Event updated', { eventId: event.id });
    res.status(200).json({
        success: true,
        data: {
            event,
        },
    });
});


    
// DELETE /api/events/:id - soft delete (marque comme supprimé)
router.delete('/:id', authMiddleware, requireRoles('ORGANIZER', 'ADMIN'), validateParams(eventIdParamsSchema), async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const event = await prisma.event.update({
        where: { id },
        data: { isDeleted: true }
    });
    logger.info('Event soft deleted', { eventId: event.id });
    res.status(200).json({
        success: true,
        data: {
            event,
        },
    });
});

// POST /api/events/:id/restore - restaure un événement supprimé
router.post('/:id/restore', authMiddleware, requireRoles('ORGANIZER', 'ADMIN'), validateParams(eventIdParamsSchema), async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const event = await prisma.event.update({
        where: { id },
        data: { isDeleted: false }
    });
    logger.info('Event restored', { eventId: event.id });
    res.status(200).json({
        success: true,
        data: {
            event,
        },
    });
});

export default router;