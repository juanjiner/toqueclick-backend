import { Pool } from "pg";
import { logger } from "../utils/logger.js";
import { getConfig } from "./appConfig.js";

let pool: Pool;

export const getPool = () => {
    console.log("init...");
    if (!pool) {
        console.log("ingresa a !pool");
        const { dbUser, dbPassword } = getConfig();
        const object = {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: dbUser,
            password: dbPassword,
            database: process.env.DB_NAME,
            max: 1, // importante para Lambda
            idleTimeoutMillis: 0,
            connectionTimeoutMillis: 2000,
            ssl:
                process.env.DB_SSL === "true"
                    ? { rejectUnauthorized: false }
                    : false,
        }
        console.log("RAW:", object.password);
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