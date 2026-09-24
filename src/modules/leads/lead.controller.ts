import { Request, Response } from "express";
import { LeadService } from "./lead.service.js";

const ipLimits = new Map<string, number>();

export class LeadController {
    private service: LeadService;

    constructor() {
        this.service = new LeadService();
    }

    createLead = async (req: Request, res: Response): Promise<any> => {
        try {
            // Protección contra Spam (1 envío cada 20 minutos por IP)
            const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
            const now = Date.now();
            const lastTime = ipLimits.get(clientIp);

            if (lastTime && now - lastTime < 20 * 60 * 1000) { // 20 minutos
                return res.status(429).json({ error: "Has enviado un formulario recientemente. Por favor intenta de nuevo en 20 minutos." });
            }

            ipLimits.set(clientIp, now);

            // Limpieza de memoria para IPs viejas
            if (ipLimits.size > 1000) {
                for (const [key, value] of ipLimits.entries()) {
                    if (now - value >= 20 * 60 * 1000) {
                        ipLimits.delete(key);
                    }
                }
            }

            const result = await this.service.createLead(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            console.error("Error creating lead:", error);
            res.status(400).json({ error: error.message });
        }
    };

    getAllLeads = async (req: Request, res: Response) => {
        try {
            const pageId = typeof req.query.pageId === 'string' ? req.query.pageId : undefined;
            const status = typeof req.query.status === 'string' ? req.query.status : undefined;
            if (pageId) {
                const results = await this.service.getLeadsByPage(pageId, status);
                res.json(results);
            } else {
                const results = await this.service.getAllLeads(status);
                res.json(results);
            }
        } catch (error: any) {
            console.error("Error fetching leads:", error);
            res.status(500).json({ error: error.message });
        }
    };

    updateLeadStatus = async (req: Request, res: Response) => {
        try {
            const id = typeof req.params.id === 'string' ? req.params.id : String(req.params.id);
            const { status } = req.body;
            const statusStr = typeof status === 'string' ? status : String(status);
            const result = await this.service.updateLeadStatus(id, statusStr);
            res.json(result);
        } catch (error: any) {
            console.error("Error updating lead status:", error);
            res.status(500).json({ error: error.message });
        }
    };
}
