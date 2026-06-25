import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service.js";

const service = new DashboardService();

export async function getDashboard(req: Request, res: Response) {
    try {
        const data = await service.getSummary();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener el dashboard" });
    }
}

export async function getExecutiveDashboard(req: Request, res: Response) {
    try {
        const data = await service.getExecutiveDashboard();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener el dashboard ejecutivo" });
    }
}