import { NextFunction, Request, Response } from "express";
import AppError from "../shared/error/AppError";

export class DefaultErrorHandler {
    handle(err: Error, req: Request, res: Response, next: NextFunction) {
        if (res.headersSent) {
            return next(err);
        }

        if (err instanceof AppError) {
            const error_body = {
                error: err.name,
                message: err.message,
                stack: err.stack, // should be disabled for production
            }
            return res
                .status(err.http_status_code)
                .send(error_body);
        }

        const error_body = {
            error: "Internal Server Error",
            message: "Ops... Something went wrong!",
        };
        return res
            .status(500)
            .send(error_body);
    }
}
