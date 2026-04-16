import * as z from "zod";
export declare const schema_id: z.ZodCoercedString<unknown>;
export declare const Event: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    date: z.ZodISODateTime;
    duree: z.ZodISOTime;
    location: z.ZodString;
    city: z.ZodString;
    price: z.ZodNumber;
    total_seats: z.ZodNumber;
    seats_available: z.ZodNumber;
    category: z.ZodString;
    organizerId: z.ZodString;
    picture: z.ZodDefault<z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>>;
}, z.core.$strip>;
export declare const User: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<{
        user: "user";
        admin: "admin";
    }>>;
}, z.core.$strip>;
//# sourceMappingURL=verif.d.ts.map