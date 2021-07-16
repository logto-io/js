import { NextFunction } from "express";
import createHttpError from "http-errors";
import { LogtoRequest, LogtoResponse } from "./types";

export const requireAuth = (req: LogtoRequest, res: LogtoResponse, next: NextFunction) => {
    if (!req.logto) {
        next(new Error('req.logto is not found, did you include the logto middleware'));
        return;
    }
    if (!req.logto.isAuthenticated()) {
        next(createHttpError(401, 'Authentication is required for this route.'));
        return;
    }
    next();
}
