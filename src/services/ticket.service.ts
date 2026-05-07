import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { HttpError } from '../utils/http-error';

function getTicketTotalPrice(price: number, quantity: number) {
    return price * quantity;
}

export const ticketService = {
    async purchaseTicket(input: { userId: string; eventId: string; quantity: number }) {
        console.log('[TICKET] Attempting purchase:', input);
        
        const ticket = await prisma.$transaction(async (tx) => {
            console.log('[TICKET] Finding event:', input.eventId);
            const event = await tx.event.findUnique({
                where: { id: input.eventId },
            });

            if (!event) {
                throw new HttpError(404, 'Event not found');
            }
            
            console.log('[TICKET] Event found:', event.id);

            const existingTicket = await tx.ticket.findFirst({
                where: {
                    userId: input.userId,
                    eventId: input.eventId,
                },
            });

            if (existingTicket) {
                throw new HttpError(409, 'You already bought a ticket for this event');
            }

            if (event.seats_available < input.quantity) {
                throw new HttpError(409, 'Not enough seats available');
            }

            console.log('[TICKET] Updating event seats...');
            await tx.event.update({
                where: { id: input.eventId },
                data: {
                    seats_available: event.seats_available - input.quantity,
                },
            });

            console.log('[TICKET] Creating ticket record...');
            return tx.ticket.create({
                data: {
                    qrCode: crypto.randomUUID(),
                    status: 'VALID',
                    userId: input.userId,
                    eventId: input.eventId,
                    quantity: input.quantity,
                    totalPrice: getTicketTotalPrice(event.price, input.quantity),
                },
                include: {
                    event: true,
                },
            });
        });

        console.log('[TICKET] Purchase successful:', ticket.id);
        return ticket;
    },

    async getMyTickets(userId: string) {
        return prisma.ticket.findMany({
            where: { userId },
            include: {
                event: true,
            },
            orderBy: {
                purchaseDate: 'desc',
            },
        });
    },
};