import {  } from "../models/event";
import type { Request, Response } from "express";
import { prisma } from "./../../lib/prisma";
import * as z from "zod";


const schema_id = z.coerce.number();
const Event = z.object({
    title: z.string(),
    description: z.string(),
    date: z.iso.datetime(),
    duree: z.iso.time(),
    lieu: z.string(),
    ville: z.string(),
    prix_billet: z.number(),
    nombre_total_places: z.number(),
    categorie: z.string(),
    image_couverture: z.union([z.number(), z.null()]).default(null)
    
})

export async function getEvents(req: Request, res: Response){
    const allEvents = await prisma.event.findMany();
    res.status(200).json(allEvents);
}

export async function getEventById(req: Request, res: Response) {
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
}



export async function createEvent(req: Request, res: Response) {
    try {
    const event = await prisma.event.create({
        data: Event.parse(req.body)
    });

    console.log("Created event:", event);

    res.status(201).json({message: 'success'})

    } catch (error) {
        if (error instanceof z.ZodError){
            res.status(400).json(error.issues);
        }
        else {
            res.status(500).json(`Erreur lors de la mise à jour de l'évènement: ${error}`);
        }
    }
}



export async function updateEvent(req: Request, res: Response) {
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
}


export async function deleteEvent(req: Request, res: Response) {
    const id_event = req.params.id;

    try {
        const event = await prisma.event.delete({where: {id: schema_id.parse(id_event)}})
        console.log("Deleted event:", event);
        res.status(200).json(`Deleted event: ${event.title}`);

    } catch (error) {
        if (error instanceof z.ZodError){
            res.status(400).json(error.issues);
        }
        else {
            res.status(500).json(`Erreur lors de la suppression de l'évènement: ${error}`);
        }
    }
}