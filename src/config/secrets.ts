import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { logger } from "../utils/logger.js";

interface RDSSecret {
    username: string;
    password: string;
}

const isLambda = (): boolean => !!process.env.AWS_LAMBDA_FUNCTION_NAME;

export const loadSecrets = async (): Promise<void> => {
    console.info("isLambda:", isLambda());
    console.info("SECRET_MANAGER:", process.env.SECRET_MANAGER);
    console.info("AWS_REGION:", process.env.AWS_REGION);
    if (!isLambda()) {
        logger.info("Ejecutándose localmente, omitiendo Secret Manager");
        return;
    }

    const secretName = process.env.SECRET_MANAGER;
    if (!secretName) {
        throw new Error("SECRET_MANAGER env var no está definedo");
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
        console.log("ver secret: ", secret);
        process.env.DB_USER = secret.username;
        process.env.DB_PASSWORD = secret.password;
        console.log("ver password secret: ", secret.password);
        logger.info("Secrets cargando desde Secret Manager");
    } catch (error) {
        logger.error("Falló al cargar secrets", error);
        throw error;
    }
};