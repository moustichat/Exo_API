export declare const authService: {
    register(input: {
        email: string;
        password: string;
    }): Promise<{
        email: string;
        role: import("../../generated/prisma/enums").Role;
        id: string;
    }>;
    login(input: {
        email: string;
        password: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            role: import("../../generated/prisma/enums").Role;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    refresh(refreshToken: string): Promise<string>;
    logout(refreshToken: string): Promise<void>;
};
//# sourceMappingURL=auth.service.d.ts.map