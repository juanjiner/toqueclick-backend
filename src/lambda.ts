import serverless from "serverless-http";
import app from "./app.js";
import { loadSecrets } from "./config/secrets.js";
import { logger } from "./utils/logger.js";

const serverlessHandler = serverless(app, {
    binary: [
        'multipart/form-data',
        'application/octet-stream',
        'image/*',
        'audio/*',
        'video/*',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ]
});

let initialized = false;

export const handler = async (event: any, context: any) => {

    try {
        if (!initialized) {
            await loadSecrets();
            initialized = true;
            logger.info("Secretos cargados correctamente");
        } else {
            logger.info("Secrets ya inicializados (warm start)");
        }
        const response = await serverlessHandler(event, context);

        return response;
    } catch (error) {
        logger.error("Error en Lambda:", error);
        throw error;
    }
};