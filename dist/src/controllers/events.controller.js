import { prisma } from "./../../lib/prisma";
import { z } from "zod";
import { Event, schema_id } from "./../verif";
export async function getEvents(req, res) {
    const allEvents = await prisma.event.findMany();
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
        res.status(201).json({ message: 'success', event: event });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json(error.issues);
        }
        else {
            res.status(500).json(`Erreur lors de la mise à jour de l'évènement: ${error}`);
        }
    }
}
export async function updateEvent(req, res) {
    try {
        const id = req.params.id;
        const event = await prisma.event.update({
            where: { id: schema_id.parse(id) },
            data: Event.parse(req.body)
        });
        console.log('Event updaté:', event);
        res.status(200).json({ message: 'Event mis à jour avec succès', event });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json(error.issues);
        }
        else {
            res.status(500).json(`Erreur lors de la mise à jour de l'évènement: ${error}`);
        }
    }
}
export async function deleteEvent(req, res) {
    const id_event = req.params.id;
    try {
        const event = await prisma.event.delete({ where: { id: schema_id.parse(id_event) } });
        console.log("Deleted event:", event);
        res.status(200).json(`Deleted event: ${event.title}`);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json(error.issues);
        }
        else {
            res.status(500).json(`Erreur lors de la suppression de l'évènement: ${error}`);
        }
    }
}
//# sourceMappingURL=events.controller.js.map