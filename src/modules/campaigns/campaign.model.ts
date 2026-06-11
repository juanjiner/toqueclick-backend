export interface Campaign {
    id: string;
    name: string;
    coverImageUrl: string | null;
    startDate: Date | null;
    expirationDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCampaignDTO {
    name: string;
    coverImageUrl?: string | null;
    startDate?: string | null;
    expirationDate?: string | null;
    status?: string;
}

export interface UpdateCampaignDTO {
    name?: string;
    coverImageUrl?: string | null;
    startDate?: string | null;
    expirationDate?: string | null;
    status?: string;
}
