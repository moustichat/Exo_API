import {} from "../models/event";
import { prisma } from "./../../lib/prisma";
export async function getEvents(req, res) {
    const allEvents = await prisma.event.findMany();
    console.log("All events:", JSON.stringify(allEvents, null, 2));
    res.status(200).json(allEvents);
}
export async function getEventById(req, res) {
    const id_event = req.params.id;
    if (id_event && typeof id_event === "string") {
        try {
            const event = await prisma.event.findUniqueOrThrow({ where: { id: parseInt(id_event) } });
            return res.status(200).json(event);
        }
        catch {
            return res.status(400).json('Cet évènement n\'existe pas'); //400 à changer
        }
    }
    // On cherche l'event dans Prisma
    return res.status(400).json('Id non valide');
}
export async function createEvent(req, res) {
    console.log('ok');
    try {
        const event = await prisma.event.create({
            data: req.body
        });
        console.log("Created event:", event);
        res.status(201).json({ message: 'success' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
}
//# sourceMappingURL=events.controller.js.map