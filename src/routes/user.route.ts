import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { userIdParamsSchema, userUpdatePasswordSchema, userUpdateProfileSchema } from "../verif";
import { validateBody, validateParams } from "../middleware/validate.middleware";
import { authMiddleware, requireRoles, requireSelfOrRoles, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { authService } from "../services/auth.service";

const router = Router();

router.use(authMiddleware);

router.get('/', requireRoles('ADMIN'), async (req: Request, res: Response) => {
    res.status(200).json(await prisma.user.findMany());
})

router.get('/tickets', async (req: AuthenticatedRequest, res: Response) => {
    const tickets = await prisma.ticket.findMany({
        where: { userId: req.user!.userId },
        include: { event: true },
        orderBy: { purchaseDate: 'desc' },
    });

    res.status(200).json(tickets);
});

router.get('/:id', validateParams(userIdParamsSchema), requireSelfOrRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    res.status(200).json(await prisma.user.findUnique({ where: { id } }));
});

router.patch('/me', validateBody(userUpdateProfileSchema), async (req: AuthenticatedRequest, res: Response) => {
    const updatedUser = await authService.updateProfile(req.user!.userId, req.body);
    res.status(200).json({ success: true, data: { user: updatedUser } });
});

router.patch('/me/password', validateBody(userUpdatePasswordSchema), async (req: AuthenticatedRequest, res: Response) => {
    await authService.updatePassword(req.user!.userId, req.body);
    res.status(200).json({ success: true });
});

router.delete('/:id', validateParams(userIdParamsSchema), requireSelfOrRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const user = await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted successfully', user });
});

export default router;