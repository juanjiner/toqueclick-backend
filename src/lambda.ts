import serverless from "serverless-http";
import app from "./app.js";
import { loadSecrets } from "./config/secrets.js";

const serverlessHandler = serverless(app);

let initialized = false;

export const handler = async (event: any, context: any) => {
    console.info("Lambda invocada");
    console.info("Request ID:", context?.awsRequestId);

    try {
        if (!initialized) {
            console.info("Cargando secretos...");
            await loadSecrets();
            initialized = true;
            console.info("Secretos cargados correctamente");
        } else {
            console.info("Secrets ya inicializados (warm start)");
        }

        console.info("Evento recibido:", JSON.stringify(event));

        const response = await serverlessHandler(event, context);

        console.info("Respuesta generada:", JSON.stringify(response));

        return response;
    } catch (error) {
        console.error("Error en Lambda:", error);
        throw error;
    }
};