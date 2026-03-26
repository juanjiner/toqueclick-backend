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
            "Config no inicializada. En local, define DB_USER y DB_PASSWORD en tu .env"
        );
    }

    return { dbUser, dbPassword };
};