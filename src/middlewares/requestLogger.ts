import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {

    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    if (sanitizedBody.accessToken) sanitizedBody.accessToken = '***';
    if (sanitizedBody.idToken) sanitizedBody.idToken = '***';
    if (sanitizedBody.refreshToken) sanitizedBody.refreshToken = '***';

    logger.info({
        method: req.method,
        url: req.url,
        body: sanitizedBody
    });

    next();

};