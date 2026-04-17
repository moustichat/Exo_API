import type { ErrorRequestHandler, RequestHandler } from "express";
import * as z from "zod";
import { Prisma } from "../../generated/prisma/client";
import { HttpError } from "../utils/http-error";

export const notFoundHandler: RequestHandler = (_req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: "Route not found",
        },
    });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof z.ZodError) {
        res.status(400).json({
            success: false,
            error: {
                message: "Validation failed",
                details: error.issues,
            },
        });
        return;
    }

    if (error instanceof HttpError) {
        res.status(error.statusCode).json({
            success: false,
            error: {
                message: error.message,
                details: error.details,
            },
        });
        return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        res.status(404).json({
            success: false,
            error: {
                message: "Resource not found",
            },
        });
        return;
    }

    res.status(500).json({
        success: false,
        error: {
            message: "Internal server error",
        },
    });
};
