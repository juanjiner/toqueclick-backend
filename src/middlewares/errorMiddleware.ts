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

    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "Máximo 5MB permitido"
        });
    }

    if (err.message?.includes("Solo imágenes")) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    console.log("ver Middleware: ", err.message);
    res.status(status).json({
        success: false,
        message: err.message || "Internal server error"
    });

};