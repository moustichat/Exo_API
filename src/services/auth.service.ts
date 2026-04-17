import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { jwtPayloadSchema } from "../verif";
import { HttpError } from "../utils/http-error";


function hashToken(rawToken: string) {
return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export const authService = {
    async register(input: { email: string; password: string }) {
        const existing = await prisma.user.findUnique({ where: { email: input.email } });

        if (existing) throw new HttpError(409, 'Email already used');
        const passwordHash = await bcrypt.hash(input.password, 10);
        const user = await prisma.user.create({
            data: {
                name: "New User",
                email: input.email,
                passwordHash,
            },
            select: { id: true, email: true, role: true },
        });
        return user;
    },

    async login(input: { email: string; password: string }) {
        const user = await prisma.user.findUnique({ where: { email: input.email } });
        if (!user) throw new HttpError(401, 'Invalid credentials');

        const ok = await bcrypt.compare(input.password, user.passwordHash);
        if (!ok) throw new HttpError(401, 'Invalid credentials');

        const payload = { userId: user.id, role: user.role };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);
        
        await prisma.refreshToken.create({
            data: {
                tokenHash: hashToken(refreshToken),
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 days
            },
        });

        return {
            user: { id: user.id, email: user.email, role: user.role },
            tokens: { accessToken, refreshToken },
            };
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