import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
function hashToken(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}
export const authService = {
    async register(input) {
        const existing = await prisma.user.findUnique({ where: { email: input.email } });
        if (existing)
            throw new Error('Email already used');
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
    async login(input) {
        const user = await prisma.user.findUnique({ where: { email: input.email } });
        if (!user)
            throw new Error('Invalid credentials');
        const ok = await bcrypt.compare(input.password, user.passwordHash);
        if (!ok)
            throw new Error('Invalid credentials');
        const payload = { userId: user.id, role: user.role };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);
        await prisma.refreshToken.create({
            data: {
                tokenHash: hashToken(refreshToken),
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });
        return {
            user: { id: user.id, email: user.email, role: user.role },
            tokens: { accessToken, refreshToken },
        };
    },
    async refresh(refreshToken) {
        const payload = verifyRefreshToken(refreshToken);
        const tokenHash = hashToken(refreshToken);
        const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
        if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
            throw new Error('Invalid refresh token');
        }
        return signAccessToken({
            userId: payload.userId,
            role: payload.role,
        });
    },
    async logout(refreshToken) {
        const tokenHash = hashToken(refreshToken);
        await prisma.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    },
};
//# sourceMappingURL=auth.service.js.map