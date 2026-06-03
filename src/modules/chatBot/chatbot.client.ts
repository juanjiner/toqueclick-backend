import { ChatResponse, Faq, FaqsResponse, TokenResponse } from "./chatbot.model.js";

const EXTERNAL_BASE_URL = "https://fepcmac.temisperu.com";
const CREDENTIALS = {
    usuario: "integracion-RxMGy3cBFu8QAl1",
    passw: "u9vxqTmNHgw63o2mn3OasK",
};

export class ChatbotClient {
    private token: string | null = null;
    private tokenExpiresAt = 0; // timestamp en ms

    /** Obtiene un token válido (cacheado, se renueva si está por expirar) */
    private async getToken(): Promise<string> {
        const now = Date.now();
        // El token dura 1 hora; lo renovamos 1 minuto antes por seguridad
        if (this.token && now < this.tokenExpiresAt - 60_000) {
            return this.token;
        }

        const res = await fetch(`${EXTERNAL_BASE_URL}/api/auth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(CREDENTIALS),
        });

        if (!res.ok) {
            throw new Error(`Error al obtener token: ${res.status} ${res.statusText}`);
        }

        const data = (await res.json()) as TokenResponse;
        this.token = data.token;
        this.tokenExpiresAt = now + 60 * 60 * 1000; // 1 hora
        return this.token;
    }

    private async authHeaders(): Promise<HeadersInit> {
        const token = await this.getToken();
        return {
            "Content-Type": "application/json",
            "Host": "fepcmac.temisperu.com",
            Authorization: `Bearer ${token}`,
        };
    }

    /** Obtiene todas las FAQs del servicio externo */
    async listFaqs(): Promise<Faq[]> {
        const headers = await this.authHeaders();
        const res = await fetch(`${EXTERNAL_BASE_URL}/api/fqas/listar`, { headers });

        if (!res.ok) {
            throw new Error(`Error al obtener FAQs: ${res.status} ${res.statusText}`);
        }

        const data = (await res.json()) as FaqsResponse;
        return data.items ?? [];
    }

    /** Envía un mensaje al asistente externo */
    async sendMessage(sesionId: string, body: string): Promise<ChatResponse> {
        const headers = await this.authHeaders();
        const payload = {
            sesionId,
            message: {
                type: "text",
                timestamp: Math.floor(Date.now() / 1000).toString(),
                text: { body },
            },
        };

        const res = await fetch(
            `${EXTERNAL_BASE_URL}/api/asistente/chat/new-message`,
            {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            }
        );

        if (!res.ok) {
            throw new Error(`Error al enviar mensaje: ${res.status} ${res.statusText}`);
        }

        return (await res.json()) as ChatResponse;
    }
}
