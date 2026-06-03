export interface Faq {
    codigo: number;
    tema: string;
    pregunta: string;
    respuesta: string;
    created_at?: string;
    updated_at?: string;
}

export interface ChatMessage {
    sesionId: string;
    body: string;
}

export interface ChatResponse {
    sesionId: string;
    reply: string;
}

export interface FaqsResponse {
    items: Faq[];
}

// Respuesta interna del servicio externo al autenticarse
export interface TokenResponse {
    token: string;
}