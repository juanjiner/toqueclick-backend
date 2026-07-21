import { Pool } from "pg";
import { logger } from "../utils/logger.js";
import { getConfig } from "./appConfig.js";

let pool: Pool;

export const getPool = () => {
    if (!pool) {
        const { dbUser, dbPassword } = getConfig();
        const object: any = {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: dbUser,
            password: dbPassword,
            database: process.env.DB_NAME,
            max: 1, // importante para Lambda
            idleTimeoutMillis: 0,
            connectionTimeoutMillis: 2000,
        };

        if (process.env.DB_SSL === 'true') {
            object.ssl = { rejectUnauthorized: false };
        }
        try {
            pool = new Pool(object);
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    return pool;
};  