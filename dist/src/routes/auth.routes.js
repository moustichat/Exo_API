import { Router } from 'express';
import { authService } from '../services/auth.service';
const router = Router();
router.post('/register', async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ success: true, data: user });
    }
    catch (e) {
        next(e);
    }
});
router.post('/login', async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.json({ success: true, data: result });
    }
    catch (e) {
        next(e);
    }
});
router.post('/refresh', async (req, res, next) => {
    try {
        const accessToken = await authService.refresh(req.body.refreshToken);
        res.json({ success: true, data: { accessToken } });
    }
    catch (e) {
        next(e);
    }
});
router.post('/logout', async (req, res, next) => {
    try {
        await authService.logout(req.body.refreshToken);
        res.json({ success: true });
    }
    catch (e) {
        next(e);
    }
});
export default router;
//# sourceMappingURL=auth.routes.js.map