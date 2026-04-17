import { Router, type Request, type Response } from "express";
import { prisma } from "./../lib/prisma";
import {
    eventCreateSchema,
    eventIdParamsSchema,
    eventUpdateSchema,
} from "../verif";
import { validateBody, validateParams } from "../middleware/validate.middleware";


const router = Router();



// GET /api/events
router.get('/', async (req: Request, res: Response) => {
    res.status(200).json(await prisma.event.findMany());
});



// Get /api/todos/:id
// :id est un parametre de route 
// il sera accessible dans l'objet req.params
router.get('/:id', validateParams(eventIdParamsSchema), async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const event = await prisma.event.findUniqueOrThrow({ where: { id } });
    res.status(200).json(event);
});



// POST /api/events
router.post('/', validateBody(eventCreateSchema), async (req: Request, res: Response) => {
    const event = await prisma.event.create({
        data: req.body
    });

    console.log("Created event:", event);

    res.status(201).json({message: 'success', event: event});
});



// PATCH /api/events/:id
router.patch('/:id', validateParams(eventIdParamsSchema), validateBody(eventUpdateSchema), async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const event = await prisma.event.update({
        where: { id },
        data: req.body
    })

    console.log('Event updaté:' , event)
    res.status(200).json({ message: 'Event mis à jour avec succès', event });

});


    
// DELETE /api/events/:id
router.delete('/:id', validateParams(eventIdParamsSchema), async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const event = await prisma.event.delete({ where: { id } })
    console.log("Deleted event:", event);
    res.status(200).json(`Deleted event: ${event.title} (id: ${event.id})`);
});

export default router;