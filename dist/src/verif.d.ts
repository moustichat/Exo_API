import * as z from "zod";
export declare const schema_id: z.ZodCUID;
export declare const categorySchema: z.ZodEnum<{
    Concert: "Concert";
    Conference: "Conference";
    Festival: "Festival";
    Sport: "Sport";
    Theatre: "Theatre";
    Other: "Other";
}>;
export declare const roleSchema: z.ZodEnum<{
    USER: "USER";
    ORGANIZER: "ORGANIZER";
    ADMIN: "ADMIN";
}>;
export declare const jwtPayloadSchema: z.ZodObject<{
    userId: z.ZodCUID;
    role: z.ZodEnum<{
        USER: "USER";
        ORGANIZER: "ORGANIZER";
        ADMIN: "ADMIN";
    }>;
}, z.core.$strict>;
export declare const eventCreateSchema: z.ZodObject<{
    picture: z.ZodDefault<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    title: z.ZodString;
    description: z.ZodString;
    date: z.ZodCoercedDate<unknown>;
    duree: z.ZodISOTime;
    location: z.ZodString;
    city: z.ZodString;
    price: z.ZodCoercedNumber<unknown>;
    total_seats: z.ZodCoercedNumber<unknown>;
    seats_available: z.ZodCoercedNumber<unknown>;
    category: z.ZodEnum<{
        Concert: "Concert";
        Conference: "Conference";
        Festival: "Festival";
        Sport: "Sport";
        Theatre: "Theatre";
        Other: "Other";
    }>;
    organizerId: z.ZodCUID;
}, z.core.$strict>;
export declare const eventUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    duree: z.ZodOptional<z.ZodISOTime>;
    location: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    total_seats: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    seats_available: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    category: z.ZodOptional<z.ZodEnum<{
        Concert: "Concert";
        Conference: "Conference";
        Festival: "Festival";
        Sport: "Sport";
        Theatre: "Theatre";
        Other: "Other";
    }>>;
    organizerId: z.ZodOptional<z.ZodCUID>;
    picture: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strict>;
export declare const authRegisterSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strict>;
export declare const authLoginSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strict>;
export declare const authTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strict>;
export declare const eventIdParamsSchema: z.ZodObject<{
    id: z.ZodCUID;
}, z.core.$strict>;
export declare const userIdParamsSchema: z.ZodObject<{
    id: z.ZodCUID;
}, z.core.$strict>;
export declare const bearerTokenSchema: z.ZodString;
//# sourceMappingURL=verif.d.ts.map