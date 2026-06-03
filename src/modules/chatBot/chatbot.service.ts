import { ChatResponse, Faq } from "./chatbot.model.js";
import { ChatbotClient } from "./chatbot.client.js";

export class ChatbotService {
    private client = new ChatbotClient();

    getFaqs(): Promise<Faq[]> {
        return this.client.listFaqs();
    }

    sendMessage(sesionId: string, body: string): Promise<ChatResponse> {
        if (!sesionId || !body?.trim()) {
            return Promise.reject(new Error("sesionId y body son requeridos"));
        }
        return this.client.sendMessage(sesionId, body.trim());
    }
}