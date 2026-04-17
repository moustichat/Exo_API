import { Router } from 'express';
import { authService } from '../services/auth.service';
import { authLoginSchema, authRegisterSchema } from '../verif';
import { validateBody } from '../middleware/validate.middleware';
import { HttpError } from '../utils/http-error';


const router = Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};


router.post('/register', validateBody(authRegisterSchema), async (req, res) => {
    await authService.register(req.body);
    const result = await authService.login(req.body);
    res.cookie('accessToken', result.tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions);
    res.status(201).json({ success: true, data: { user: result.user } });
});


router.post('/login', validateBody(authLoginSchema), async (req, res) => {
    const result = await authService.login(req.body);
    res.cookie('accessToken', result.tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions);
    res.json({ success: true, data: { user: result.user } });
});

router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new HttpError(401, 'No refresh token provided');
    
    const accessToken = await authService.refresh(refreshToken);
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.json({ success: true, data: { accessToken } });
});

router.post('/logout', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await authService.logout(refreshToken);
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true });
});

export default router;