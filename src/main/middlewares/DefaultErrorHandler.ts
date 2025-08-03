import { NextFunction, Request, Response } from "express";

export class DefaultErrorHandler {
    handle(err: Error, req: Request, res: Response, next: NextFunction) {
        const errorBody = {
            error: err.name,
            message: err.message,
            stack: err.stack,
        }
        res
            .status(400)
            .send(errorBody);
    }
}
