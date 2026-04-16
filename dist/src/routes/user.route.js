import { Router } from "express";
import { prisma } from "../lib/prisma";
import { User, schema_id } from "../verif";
const router = Router();
router.get('/', async (req, res) => {
    res.status(200).json(await prisma.user.findMany());
});
router.get('/:id', async (req, res) => {
    const id_user = req.params.id;
    res.status(200).json(await prisma.user.findUnique({ where: { id: schema_id.parse(id_user) } }));
});
export default router;
//# sourceMappingURL=user.route.js.map