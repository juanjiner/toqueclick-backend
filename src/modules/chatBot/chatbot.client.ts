import { ChatResponse, Faq, FaqsResponse, TokenResponse } from "./chatbot.model.js";

const EXTERNAL_BASE_URL = "http://100.52.168.9";
const CREDENTIALS = {
    usuario: "integracion-RxMGy3cBFu8QAl1",
    passw: "u9vxqTmNHgw63o2mn3OasK",
};

export class ChatbotClient {
    private token: string | null = null;
    private tokenExpiresAt = 0;

    private log(method: string, message: string, data?: unknown) {
        const timestamp = new Date().toISOString();
        const prefix = `[ChatbotClient][${timestamp}][${method}]`;
        if (data !== undefined) {
            console.log(`${prefix} ${message}`, data);
        } else {
            console.log(`${prefix} ${message}`);
        }
    }

    private logError(method: string, message: string, error?: unknown) {
        const timestamp = new Date().toISOString();
        console.error(`[ChatbotClient][${timestamp}][${method}] ${message}`, error ?? "");
    }

    private async getToken(): Promise<string> {
        const now = Date.now();

        if (this.token && now < this.tokenExpiresAt - 60_000) {
            this.log("getToken", "Token en caché vigente, reutilizando.");
            return this.token;
        }

        this.log("getToken", "Token expirado o inexistente. Solicitando nuevo token...");
        this.log("getToken", `POST ${EXTERNAL_BASE_URL}/api/auth/token`, {
            usuario: CREDENTIALS.usuario,
            passw: "***",
        });

        let res: Response;
        try {
            res = await fetch(`${EXTERNAL_BASE_URL}/api/auth/token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(CREDENTIALS),
            });
        } catch (err) {
            this.logError("getToken", "No se pudo conectar al servidor de autenticación.", err);
            throw err;
        }

        this.log("getToken", `Respuesta HTTP: ${res.status} ${res.statusText}`);

        if (!res.ok) {
            const body = await res.text().catch(() => "(no se pudo leer el body)");
            this.logError("getToken", `El servidor rechazó la autenticación. Body: ${body}`);
            throw new Error(`Error al obtener token: ${res.status} ${res.statusText}`);
        }

        let data: TokenResponse;
        try {
            data = (await res.json()) as TokenResponse;
        } catch (err) {
            this.logError("getToken", "No se pudo parsear la respuesta JSON del token.", err);
            throw err;
        }

        this.token = data.token;
        this.tokenExpiresAt = now + 60 * 60 * 1000;
        this.log("getToken", `Token obtenido exitosamente. Expira en: ${new Date(this.tokenExpiresAt).toISOString()}`);

        return this.token;
    }

    private async authHeaders(): Promise<HeadersInit> {
        const token = await this.getToken();
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    }

    async listFaqs(): Promise<Faq[]> {
        this.log("listFaqs", `GET ${EXTERNAL_BASE_URL}/api/fqas/listar`);

        let res: Response;
        try {
            const headers = await this.authHeaders();
            res = await fetch(`${EXTERNAL_BASE_URL}/api/fqas/listar`, { headers });
        } catch (err) {
            this.logError("listFaqs", "No se pudo conectar al endpoint de FAQs.", err);
            throw err;
        }

        this.log("listFaqs", `Respuesta HTTP: ${res.status} ${res.statusText}`);

        if (!res.ok) {
            const body = await res.text().catch(() => "(no se pudo leer el body)");
            this.logError("listFaqs", `Error al obtener FAQs. Body: ${body}`);
            throw new Error(`Error al obtener FAQs: ${res.status} ${res.statusText}`);
        }

        let data: FaqsResponse;
        try {
            data = (await res.json()) as FaqsResponse;
        } catch (err) {
            this.logError("listFaqs", "No se pudo parsear la respuesta JSON de FAQs.", err);
            throw err;
        }

        const items = data.items ?? [];
        this.log("listFaqs", `FAQs obtenidas: ${items.length} ítem(s).`);
        return items;
    }

    async sendMessage(sesionId: string, body: string): Promise<ChatResponse> {
        this.log("sendMessage", `POST ${EXTERNAL_BASE_URL}/api/asistente/chat/new-message`);
        this.log("sendMessage", "Payload:", { sesionId, body });

        const payload = {
            sesionId,
            message: {
                type: "text",
                timestamp: Math.floor(Date.now() / 1000).toString(),
                text: { body },
            },
        };

        let res: Response;
        try {
            const headers = await this.authHeaders();
            res = await fetch(
                `${EXTERNAL_BASE_URL}/api/asistente/chat/new-message`,
                { method: "POST", headers, body: JSON.stringify(payload) }
            );
        } catch (err) {
            this.logError("sendMessage", "No se pudo conectar al endpoint de chat.", err);
            throw err;
        }

        this.log("sendMessage", `Respuesta HTTP: ${res.status} ${res.statusText}`);

        if (!res.ok) {
            const errorBody = await res.text().catch(() => "(no se pudo leer el body)");
            this.logError("sendMessage", `Error al enviar mensaje. Body: ${errorBody}`);
            throw new Error(`Error al enviar mensaje: ${res.status} ${res.statusText}`);
        }

        let result: ChatResponse;
        try {
            result = (await res.json()) as ChatResponse;
        } catch (err) {
            this.logError("sendMessage", "No se pudo parsear la respuesta JSON del chat.", err);
            throw err;
        }

        this.log("sendMessage", "Mensaje enviado y respuesta recibida.", result);
        return result;
    }
}