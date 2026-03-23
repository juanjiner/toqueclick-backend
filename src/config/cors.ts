import cors from "cors";

export const corsConfig = cors({
    origin: ["http://localhost:4200"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
});