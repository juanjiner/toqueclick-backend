import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { logger } from "../utils/logger.js";

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
        throw new Error("SECRET_MANAGER env var no está definedo");
    }

    try {
        const client = new SecretsManagerClient({
            region: process.env.AWS_REGION,
        });

        const response = await client.send(
            new GetSecretValueCommand({ SecretId: secretName })
        );

        if (!response.SecretString) {
            throw new Error("SecretString está vacío");
        }

        const secret: RDSSecret = JSON.parse(response.SecretString);

        process.env.DB_USER = secret.username;
        process.env.DB_PASSWORD = secret.password;

        logger.info("Secrets cargando desde Secret Manager");
    } catch (error) {
        logger.error("Falló al cargar secrets", error);
        throw error;
    }
};