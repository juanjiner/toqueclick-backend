import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {

    logger.info({
        method: req.method,
        url: req.url,
        body: req.body
    });

    next();

};