import * as z from "zod";

const categoryValues = ["Concert", "Conference", "Festival", "Sport", "Theatre", "Other"] as const;

const eventBaseShape = {
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    date: z.coerce.date(),
    duree: z.iso.time(),
    location: z.string().trim().min(1),
    city: z.string().trim().min(1),
    price: z.coerce.number().int().nonnegative(),
    total_seats: z.coerce.number().int().nonnegative(),
    seats_available: z.coerce.number().int().nonnegative(),
    category: z.enum(categoryValues),
    organizerId: z.cuid(),
    picture: z.coerce.number().int().nonnegative().nullable(),
} as const;

export const schema_id = z.cuid();

export const categorySchema = z.enum(categoryValues);
export const roleSchema = z.enum(["USER", "ORGANIZER", "ADMIN"]);
export const jwtPayloadSchema = z.object({
    userId: schema_id,
    role: roleSchema,
}).passthrough();

export const eventCreateSchema = z.object({
    ...eventBaseShape,
    picture: eventBaseShape.picture.default(null),
}).strict().refine((value) => value.seats_available <= value.total_seats, {
    message: "seats_available must be less than or equal to total_seats",
    path: ["seats_available"],
});

export const eventUpdateSchema = z.object(eventBaseShape).strict().partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
}).superRefine((value, context) => {
    if (value.seats_available !== undefined && value.total_seats !== undefined && value.seats_available > value.total_seats) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "seats_available must be less than or equal to total_seats",
            path: ["seats_available"],
        });
    }
});

export const authRegisterSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
}).strict();

export const authLoginSchema = authRegisterSchema;

export const authTokenSchema = z.object({
    refreshToken: z.string().min(1),
}).strict();

export const eventIdParamsSchema = z.object({
    id: schema_id,
}).strict();

export const userIdParamsSchema = z.object({
    id: schema_id,
}).strict();

export const bearerTokenSchema = z.string().regex(/^Bearer\s+\S+$/);