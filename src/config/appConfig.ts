interface AppConfig {
    dbUser: string;
    dbPassword: string;
}

let config: AppConfig | null = null;

export const setConfig = (values: AppConfig) => {
    config = values;
};

export const getConfig = (): AppConfig => {
    if (config) {
        return config;
    }
    // Fallback para entorno local: leer directamente de .env
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;

    if (!dbUser || !dbPassword) {
        throw new Error(
            "Config no inicializada..."
        );
    }

    return { dbUser, dbPassword };
};