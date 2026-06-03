import { Request, Response } from "express";
import { ChatbotService } from "./chatbot.service.js";
import { successResponse } from "../../utils/apiResponse.js";

export class ChatbotController {
    private service = new ChatbotService();

    getFaqs = async (_req: Request, res: Response): Promise<void> => {
        const faqs = await this.service.getFaqs();
        res.json(successResponse(faqs));
    };

    sendMessage = async (req: Request, res: Response): Promise<void> => {
        const { sesionId, body } = req.body as { sesionId: string; body: string };
        const response = await this.service.sendMessage(sesionId, body);
        res.json(successResponse(response));
    };
}