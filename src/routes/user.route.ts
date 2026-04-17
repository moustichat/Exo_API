import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { userIdParamsSchema } from "../verif";
import { validateParams } from "../middleware/validate.middleware";

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    res.status(200).json(await prisma.user.findMany());
})

router.get('/:id', validateParams(userIdParamsSchema), async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    res.status(200).json(await prisma.user.findUnique({ where: { id } }));
});

router.delete('/:id', validateParams(userIdParamsSchema), async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const user = await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted successfully', user });
});

export default router;