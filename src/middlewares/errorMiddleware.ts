import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    logger.error(err);

    const status = err.status || 500;

    res.status(status).json({
        success: false,
        message: err.message || "Internal server error"
    });

};