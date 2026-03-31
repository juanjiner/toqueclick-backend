import cors from "cors";

export const corsConfig = cors({
    origin: ["http://localhost:4200", "https://toqueclick.com"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
});