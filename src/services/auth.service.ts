import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { jwtPayloadSchema } from "../verif";
import { HttpError } from "../utils/http-error";

type SessionUser = {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ORGANIZER' | 'ADMIN';
};


function hashToken(rawToken: string) {
return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function buildSession(user: SessionUser) {
    const payload = { userId: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return {
        user,
        tokens: { accessToken, refreshToken },
    };
}

async function storeRefreshToken(userId: string, refreshToken: string) {
    await prisma.refreshToken.create({
        data: {
            tokenHash: hashToken(refreshToken),
            userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
}

export const authService = {
    async register(input: { email: string; password: string; name: string }) {
        const existing = await prisma.user.findUnique({ where: { email: input.email } });

        if (existing) throw new HttpError(409, 'Email already used');
        const passwordHash = await bcrypt.hash(input.password, 10);
        const user = await prisma.user.create({
            data: {
                name: input.name,
                email: input.email,
                passwordHash,
            },
            select: { id: true, email: true, name: true, role: true },
        });
        return user;
    },

    async login(input: { email: string; password: string }) {
        const user = await prisma.user.findUnique({ where: { email: input.email } });
        if (!user) throw new HttpError(401, 'Invalid credentials');

        const ok = await bcrypt.compare(input.password, user.passwordHash);
        if (!ok) throw new HttpError(401, 'Invalid credentials');

        const session = buildSession({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });

        await storeRefreshToken(user.id, session.tokens.refreshToken);

        return {
            user: session.user,
            tokens: session.tokens,
        };
    },

    async becomeOrganizer(userId: string) {
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true },
        });

        if (!currentUser) {
            throw new HttpError(404, 'User not found');
        }

        const nextRole = currentUser.role === 'ADMIN' ? currentUser.role : 'ORGANIZER';
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: nextRole },
            select: { id: true, email: true, name: true, role: true },
        });

        await prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });

        const session = buildSession(updatedUser);
        await storeRefreshToken(updatedUser.id, session.tokens.refreshToken);

        return session;
    },

    async getCurrentUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true },
        });

        if (!user) {
            throw new HttpError(404, 'User not found');
        }

        return user;
    },

    async updateProfile(userId: string, input: { name?: string; email?: string }) {
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!currentUser) {
            throw new HttpError(404, 'User not found');
        }

        if (input.email && input.email !== currentUser.email) {
            const duplicate = await prisma.user.findUnique({ where: { email: input.email } });
            if (duplicate) {
                throw new HttpError(409, 'Email already used');
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(input.name ? { name: input.name } : {}),
                ...(input.email ? { email: input.email } : {}),
            },
            select: { id: true, email: true, name: true, role: true },
        });

        return updatedUser;
    },

    async updatePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!currentUser) {
            throw new HttpError(404, 'User not found');
        }

        const ok = await bcrypt.compare(input.currentPassword, currentUser.passwordHash);
        if (!ok) {
            throw new HttpError(401, 'Invalid credentials');
        }

        const passwordHash = await bcrypt.hash(input.newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        return true;
    },

    async refresh(refreshToken: string) {
        let payload: ReturnType<typeof jwtPayloadSchema.parse>;
        try {
            payload = jwtPayloadSchema.parse(verifyRefreshToken(refreshToken));
        } catch (error) {
            throw new HttpError(401, 'Invalid refresh token');
        }
        const tokenHash = hashToken(refreshToken);
        const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

        if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
            throw new HttpError(401, 'Invalid refresh token');
        }

        return signAccessToken({
            userId: payload.userId,
            role: payload.role,
        });
    },

    async logout(refreshToken: string) {
        const tokenHash = hashToken(refreshToken);
        await prisma.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    },
};