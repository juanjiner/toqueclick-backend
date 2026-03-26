import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { logger } from "../utils/logger.js";
import { setConfig } from "./appConfig.js";

interface RDSSecret {
    username: string;
    password: string;
}

const isLambda = (): boolean => !!process.env.AWS_LAMBDA_FUNCTION_NAME;

export const loadSecrets = async (): Promise<void> => {
    if (!isLambda()) {
        logger.info("Ejecutándose localmente, omitiendo Secret Manager");
        return;
    }

    const secretName = process.env.SECRET_MANAGER;
    if (!secretName) {
        throw new Error("SECRET_MANAGER no está definedo");
    }

    try {
        const client = new SecretsManagerClient({
            region: process.env.AWS_REGION,
            requestHandler: new NodeHttpHandler({
                connectionTimeout: 3000,
                requestTimeout: 5000,
            }),
        });

        const response = await client.send(
            new GetSecretValueCommand({ SecretId: secretName })
        );

        if (!response.SecretString) {
            throw new Error("SecretString está vacío");
        }

        const secret: RDSSecret = JSON.parse(response.SecretString);
        setConfig({
            dbUser: secret.username,
            dbPassword: secret.password,
        });
        process.env.DB_USER = secret.username;
        process.env.DB_PASSWORD = encodeURIComponent(secret.password);
        logger.info("Secrets cargando desde Secret Manager");
    } catch (error) {
        logger.error("Falló al cargar secrets", error);
        throw error;
    }
};