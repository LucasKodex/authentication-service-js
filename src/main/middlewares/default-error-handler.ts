import { NextFunction, Request, Response } from "express";

export function defaultErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    const errorBody = {
        error: err.name,
        message: err.message,
        stack: err.stack,
    }
    res.send(errorBody);
}
