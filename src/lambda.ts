import serverless from "serverless-http";
import app from "./app.js";
import { loadSecrets } from "./config/secrets.js";

const serverlessHandler = serverless(app);

let initialized = false;

export const handler = async (event: any, context: any) => {
    if (!initialized) {
        await loadSecrets();
        initialized = true;
    }

    return serverlessHandler(event, context);
};