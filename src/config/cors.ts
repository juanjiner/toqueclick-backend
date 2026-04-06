import cors from "cors";

export const corsConfig = cors({
    origin: ["http://localhost:4200", "https://toqueclick.com", "https://toquefacil.net", "https://toquepay.com.pe", "https://toqueapp.pe"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
});
