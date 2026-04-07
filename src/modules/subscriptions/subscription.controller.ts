import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse.js";
import { SubscriptionService } from "./subscription.service.js";

export class SubscriptionController {

    private service = new SubscriptionService();

    subscribe = async (req: Request, res: Response) => {
        const subscription = await this.service.subscribe(req.body.email);
        res.status(201).json(successResponse(subscription, "Suscripción exitosa"));
    };

    unsubscribe = async (req: Request, res: Response) => {
        await this.service.unsubscribe(req.body.email);
        res.json(successResponse(null, "Desuscripción exitosa"));
    };
}