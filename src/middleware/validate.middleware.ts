import type { NextFunction, Request, RequestHandler, Response } from "express";
import * as z from "zod";

type RequestPart = "body" | "params" | "query";

type ValidationOptions = {
    part: RequestPart;
};

function formatZodError(error: z.ZodError) {
    return error.issues;
}

export function validateRequest<TSchema extends z.ZodTypeAny>(
    schema: TSchema,
    options: ValidationOptions,
): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[options.part]);

        if (!result.success) {
            return res.status(400).json(formatZodError(result.error));
        }

        req[options.part] = result.data;
        next();
    };
}

export function validateBody<TSchema extends z.ZodTypeAny>(schema: TSchema): RequestHandler {
    return validateRequest(schema, { part: "body" });
}

export function validateParams<TSchema extends z.ZodTypeAny>(schema: TSchema): RequestHandler {
    return validateRequest(schema, { part: "params" });
}

export function validateQuery<TSchema extends z.ZodTypeAny>(schema: TSchema): RequestHandler {
    return validateRequest(schema, { part: "query" });
}
