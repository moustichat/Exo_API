export type JwtPayload = {
    userId: string;
    email: string;
    role: string;
};
export declare function signAccessToken(payload: JwtPayload): never;
export declare function signRefreshToken(payload: JwtPayload): never;
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function verifyRefreshToken(token: string): JwtPayload;
//# sourceMappingURL=jwt.d.ts.map