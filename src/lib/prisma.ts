import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        ...(process.env.PRISMA_ACCELERATE_URL && {accelerateUrl: process.env.PRISMA_ACCELERATE_URL}),
        log: ['warn', 'error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;