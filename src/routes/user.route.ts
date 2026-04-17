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

export default router;