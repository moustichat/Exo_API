import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { HttpError } from '../utils/http-error';

function getTicketTotalPrice(price: number, quantity: number) {
    return price * quantity;
}

export const ticketService = {
    async purchaseTicket(input: { userId: string; eventId: string; quantity: number }) {
        const result = await prisma.$transaction(async (tx) => {
            const event = await tx.event.findUnique({
                where: { id: input.eventId },
            });

            if (!event) {
                throw new HttpError(404, 'Event not found');
            }

            if (event.seats_available < input.quantity) {
                throw new HttpError(409, 'Not enough seats available');
            }

            await tx.event.update({
                where: { id: input.eventId },
                data: {
                    seats_available: event.seats_available - input.quantity,
                },
            });

            const existingTicket = await tx.ticket.findFirst({
                where: {
                    userId: input.userId,
                    eventId: input.eventId,
                },
            });

            if (existingTicket) {
                // Update existing ticket: add quantity and update total price
                const updatedTicket = await tx.ticket.update({
                    where: { id: existingTicket.id },
                    data: {
                        quantity: existingTicket.quantity + input.quantity,
                        totalPrice: getTicketTotalPrice(event.price, existingTicket.quantity + input.quantity),
                    },
                    include: {
                        event: true,
                    },
                });
                return {
                    ticket: updatedTicket,
                    purchasedQuantity: input.quantity,
                };
            }

            const newTicket = await tx.ticket.create({
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
            return {
                ticket: newTicket,
                purchasedQuantity: input.quantity,
            };
        });

        // Return ticket with purchasedQuantity field for frontend
        return {
            ...result.ticket,
            purchasedQuantity: result.purchasedQuantity,
        };
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

    async removeTicketQuantity(input: { userId: string; ticketId: number; quantity: number }) {
        return prisma.$transaction(async (tx) => {
            const ticket = await tx.ticket.findFirst({
                where: {
                    id: input.ticketId,
                    userId: input.userId,
                },
                include: {
                    event: true,
                },
            });

            if (!ticket) {
                throw new HttpError(404, 'Ticket not found');
            }

            if (input.quantity > ticket.quantity) {
                throw new HttpError(409, 'Cannot remove more tickets than owned');
            }

            const event = await tx.event.findUnique({
                where: { id: ticket.eventId },
            });

            if (!event) {
                throw new HttpError(404, 'Event not found');
            }

            const seatsAvailable = Math.min(event.total_seats, event.seats_available + input.quantity);

            await tx.event.update({
                where: { id: ticket.eventId },
                data: {
                    seats_available: seatsAvailable,
                },
            });

            if (input.quantity === ticket.quantity) {
                await tx.ticket.delete({
                    where: { id: ticket.id },
                });

                return {
                    removedQuantity: input.quantity,
                    remainingTicket: null,
                    event: {
                        ...event,
                        seats_available: seatsAvailable,
                    },
                };
            }

            const remainingQuantity = ticket.quantity - input.quantity;
            const remainingTicket = await tx.ticket.update({
                where: { id: ticket.id },
                data: {
                    quantity: remainingQuantity,
                    totalPrice: getTicketTotalPrice(event.price, remainingQuantity),
                },
                include: {
                    event: true,
                },
            });

            return {
                removedQuantity: input.quantity,
                remainingTicket,
                event: {
                    ...event,
                    seats_available: seatsAvailable,
                },
            };
        });
    },
};