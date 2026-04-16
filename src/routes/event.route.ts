import { Router, type Request, type Response } from "express";
import { prisma } from "./../lib/prisma";
import { Event, schema_id } from "../verif";
import * as z from "zod";


const router = Router();



// GET /api/events
router.get('/', async (req: Request, res: Response) => {
    res.status(200).json(await prisma.event.findMany());
});


// Get /api/todos/:id
// :id est un parametre de route 
// il sera accessible dans l'objet req.params
router.get('/:id', async (req: Request, res: Response) => {
        try {
            const id_event = req.params.id;
            const event = await prisma.event.findUniqueOrThrow({where: {id: schema_id.parse(id_event)}})
            res.status(200).json(event)
    
        } catch (error) {
            if (error instanceof z.ZodError){
                res.status(400).json(error.issues);
            }
            else throw error;
        }
});


// POST /api/events
router.post('/', async (req: Request, res: Response) => {
    try {
    const event = await prisma.event.create({
        data: Event.parse(req.body)
    });

    console.log("Created event:", event);

    res.status(201).json({message: 'success', event: event});

    } catch (error) {
        if (error instanceof z.ZodError){
            res.status(400).json(error.issues);
        }
        else {
            res.status(500).json(`Erreur lors de la mise à jour de l'évènement: ${error}`);
        }
    }
});


// PATCH /api/events/:id
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const event = await prisma.event.update({
            where: {id: schema_id.parse(id)},
            data: Event.parse(req.body)
        })

        console.log('Event updaté:' , event)
        res.status(200).json({ message: 'Event mis à jour avec succès', event });

    } catch (error) {
        if (error instanceof z.ZodError){
            res.status(400).json(error.issues);
        }
        else {
            res.status(500).json(`Erreur lors de la mise à jour de l'évènement: ${error}`);
        }
    }
});



    
// DELETE /api/events/:id
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id_event = req.params.id;

        const event = await prisma.event.delete({where: {id: schema_id.parse(id_event)}})
        console.log("Deleted event:", event);
        res.status(200).json(`Deleted event: ${event.title} (id: ${event.id})`);

    } catch (error) {
        if (error instanceof z.ZodError){
            res.status(400).json(error.issues);
        }
        else {
            res.status(500).json(`Erreur lors de la suppression de l'évènement: ${error}`);
        }
    }
});

export default router;