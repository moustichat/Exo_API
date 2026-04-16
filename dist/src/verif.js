import * as z from "zod";
export const schema_id = z.coerce.string();
export const Event = z.object({
    title: z.string(),
    description: z.string(),
    date: z.iso.datetime(),
    duree: z.iso.time(),
    location: z.string(),
    city: z.string(),
    price: z.number(),
    total_seats: z.number(),
    seats_available: z.number(),
    category: z.string(),
    organizerId: z.string(),
    picture: z.union([z.number(), z.null()]).default(null)
});
export const User = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(8),
    role: z.enum(['user', 'admin']).default('user')
});
//# sourceMappingURL=verif.js.map