interface AppConfig {
    dbUser: string;
    dbPassword: string;
}

let config: AppConfig | null = null;

export const setConfig = (values: AppConfig) => {
    config = values;
};

export const getConfig = (): AppConfig => {
    if (!config) {
        throw new Error("Config no inicializada");
    }
    return config;
};