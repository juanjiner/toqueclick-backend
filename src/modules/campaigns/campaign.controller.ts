import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse.js";
import { CampaignService } from "./campaign.service.js";

export class CampaignController {

    private service = new CampaignService();

    getAll = async (_req: Request, res: Response) => {
        const campaigns = await this.service.getAllCampaigns();
        res.json(successResponse(campaigns));
    };

    getById = async (req: Request, res: Response) => {
        const campaign = await this.service.getCampaignById(String(req.params.id));
        res.json(successResponse(campaign));
    };

    create = async (req: Request, res: Response) => {
        const campaign = await this.service.createCampaign(req.body, req.file);
        res.status(201).json(successResponse(campaign));
    };

    update = async (req: Request, res: Response) => {
        const campaign = await this.service.updateCampaign(String(req.params.id), req.body, req.file);
        res.json(successResponse(campaign));
    };

    delete = async (req: Request, res: Response) => {
        await this.service.deleteCampaign(String(req.params.id));
        res.json(successResponse(null, "Campaña eliminada correctamente"));
    };
}
