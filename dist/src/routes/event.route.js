import { Router } from "express";
import { getEvents, getEventById, createEvent, deleteEvent, updateEvent } from "../controllers/events.controller";
const router = Router();
// GET /api/events
router.get('/', getEvents);
// Get /api/todos/:id
// :id est un parametre de route 
// il sera accessible dans l'objet req.params
router.get('/:id', getEventById);
// POST /api/events
router.post('/', createEvent);
// PATCH /api/events/:id
router.patch('/:id', updateEvent);
// DELETE /api/events/:id
router.delete('/:id', deleteEvent);
export default router;
//# sourceMappingURL=event.route.js.map