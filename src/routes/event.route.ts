import { Router, type Request, type Response } from "express";
import { prisma } from "./../lib/prisma";
import {
    eventCreateSchema,
    eventIdParamsSchema,
    eventUpdateSchema,
} from "../verif";
import { validateBody, validateParams } from "../middleware/validate.middleware";
import { authMiddleware, requireRoles, type AuthenticatedRequest } from "../middleware/auth.middleware";


const router = Router();



// GET /api/events
router.get('/', async (req: Request, res: Response) => {
    const events = await prisma.event.findMany();
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

    console.log("Created event:", event);

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

    console.log('Event updaté:' , event)
    res.status(200).json({
        success: true,
        data: {
            event,
        },
    });
});


    
// DELETE /api/events/:id
router.delete('/:id', authMiddleware, requireRoles('ORGANIZER', 'ADMIN'), validateParams(eventIdParamsSchema), async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const event = await prisma.event.delete({ where: { id } })
    console.log("Deleted event:", event);
    res.status(200).json({
        success: true,
        data: {
            event,
        },
    });
});

export default router;