import {  } from "../models/event";
import type { Request, Response } from "express";
import { prisma } from "./../../lib/prisma";
import * as z from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";


const schema_id = z.coerce.number();
const Event = z.object({
    
})

export async function getEvents(req: Request, res: Response){
    const allEvents = await prisma.event.findMany();
    console.log("All events:", JSON.stringify(allEvents, null, 2));
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
        else if (error instanceof PrismaClientKnownRequestError) {
            res.status(400).json("Identifiant introuvable");
        }
        else throw error;
    }
}



export async function createEvent(req: Request, res: Response) {
    try {
    const event = await prisma.event.create({
        data: {
            title: req.body.title,
            description: req.body.description,
            date: new Date(req.body.date),
            heure: req.body.heure,
            lieu: req.body.lieu,
            ville: req.body.ville,
            prix_billet: Number(req.body.prix_billet),
            nombre_total_places: Number(req.body.nombre_total_places),
            categorie: req.body.categorie,
            image_couverture: Number(req.body.image_couverture)
        }
    });

    console.log("Created event:", event);

    res.status(201).json({message: 'success'})

    } catch {
        res.status(500).json({error: 'Erreur serveur'})
        
    }
}



export async function updateEvent(req: Request, res: Response) {
    try {
        const id = req.params.id;

        // Validation de l'ID
        if (!id || typeof id !== "string") {
            return res.status(400).json({ error: 'Id non valide' });
        }

        const event = await prisma.event.update({
            where: {id: parseInt(id)},
            data: req.body
        })

        console.log('Event updaté:' , event)
        res.status(200).json({ message: 'Event mis à jour avec succès', event });

    } catch (error) {
        console.log('erreur de mise a jour: ', error)
        res.status(500).json({ error: 'Erreur serveur' });
    }
}


export async function deleteEvent(req: Request, res: Response) {
    const id_event = req.params.id;
    if (id_event && typeof id_event === "string"){
        try {
            const event = await prisma.event.delete({where: {id: parseInt(id_event)}})
            console.log("Deleted event:", event);
            res.status(200).json(`"Deleted event: ${event}`)
        } catch (PrismaClientKnownRequestError ) {
            res.status(404).json('Cet évènement n\'existe pas')
        }
    }
    // On cherche l'event dans Prisma
    res.status(400).json('Id non valide')
}