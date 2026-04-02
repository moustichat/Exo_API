import {} from "../models/event";
import { prisma } from "./../../lib/prisma";
import * as z from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
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
    image_couverture: z.union([z.number(), z.null()])
});
export async function getEvents(req, res) {
    const allEvents = await prisma.event.findMany();
    console.log("All events:", JSON.stringify(allEvents, null, 2));
    res.status(200).json(allEvents);
}
export async function getEventById(req, res) {
    try {
        const id_event = req.params.id;
        const event = await prisma.event.findUniqueOrThrow({ where: { id: schema_id.parse(id_event) } });
        res.status(200).json(event);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json(error.issues);
        }
        else if (error instanceof PrismaClientKnownRequestError) {
            res.status(400).json("Identifiant introuvable");
        }
        else
            throw error;
    }
}
export async function createEvent(req, res) {
    try {
        const event = await prisma.event.create({
            data: Event.parse(req.body)
        });
        console.log("Created event:", event);
        res.status(201).json({ message: 'success' });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json(error.issues);
        }
        else
            throw error;
    }
}
export async function updateEvent(req, res) {
    try {
        const id = req.params.id;
        // Validation de l'ID
        if (!id || typeof id !== "string") {
            return res.status(400).json({ error: 'Id non valide' });
        }
        const event = await prisma.event.update({
            where: { id: parseInt(id) },
            data: req.body
        });
        console.log('Event updaté:', event);
        res.status(200).json({ message: 'Event mis à jour avec succès', event });
    }
    catch (error) {
        console.log('erreur de mise a jour: ', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}
export async function deleteEvent(req, res) {
    const id_event = req.params.id;
    if (id_event && typeof id_event === "string") {
        try {
            const event = await prisma.event.delete({ where: { id: parseInt(id_event) } });
            console.log("Deleted event:", event);
            res.status(200).json(`"Deleted event: ${event}`);
        }
        catch (PrismaClientKnownRequestError) {
            res.status(404).json('Cet évènement n\'existe pas');
        }
    }
    // On cherche l'event dans Prisma
    res.status(400).json('Id non valide');
}
//# sourceMappingURL=events.controller.js.map