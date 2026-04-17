import { Router } from 'express';
import { authService } from '../services/auth.service';
import { authLoginSchema, authRegisterSchema, authTokenSchema } from '../verif';
import { validateBody } from '../middleware/validate.middleware';


const router = Router();


router.post('/register', validateBody(authRegisterSchema), async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
});


router.post('/login', validateBody(authLoginSchema), async (req, res) => {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
});

router.post('/refresh', validateBody(authTokenSchema), async (req, res) => {
    const accessToken = await authService.refresh(req.body.refreshToken);
    res.json({ success: true, data: { accessToken } });
});

router.post('/logout', validateBody(authTokenSchema), async (req, res) => {
    await authService.logout(req.body.refreshToken);
    res.json({ success: true });
});

export default router;