import jwt, { type SignOptions} from 'jsonwebtoken';

export type JwtPayload = {
    userId: string;
    role: string;
};



const accessSecret = process.env.JWT_ACCESS_SECRET as string;
const refreshSecret = process.env.JWT_REFRESH_SECRET as string;

export function signAccessToken(payload: JwtPayload) {
    return jwt.sign(payload,
                    accessSecret,
                    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] || '15m' });
}

export function signRefreshToken(payload: JwtPayload) {
    return jwt.sign(payload,
                    refreshSecret,
                    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] || '7d' });
}


export function verifyAccessToken(token: string) {
    return jwt.verify(token, accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, refreshSecret) as JwtPayload;
}