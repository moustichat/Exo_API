import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { User, schema_id } from "../verif";

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    res.status(200).json(await prisma.user.findMany());
})

router.get('/:id', async (req: Request, res: Response) => {
    const id_user = req.params.id;
    res.status(200).json(await prisma.user.findUnique({ where: { id: schema_id.parse(id_user) } }));
});

export default router;