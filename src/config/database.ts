import { Pool } from "pg";
import { logger } from "../utils/logger.js";

let pool: Pool;

export const getPool = () => {
    console.log("init...");
    if (!pool) {
        console.log("ingresa a !pool");
        const object = {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            max: 1, // importante para Lambda
            idleTimeoutMillis: 0,
            connectionTimeoutMillis: 2000,
            ssl:
                process.env.DB_SSL === "true"
                    ? { rejectUnauthorized: false }
                    : false,
        }
        logger.info("ver datos de conexion: ", object);
        try {
            pool = new Pool(object);
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    return pool;
};