export interface Campaign {
    id: string;
    name: string;
    bannerImageUrls: string[];
    isActive: boolean;
    startDate: Date | null;
    expirationDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCampaignDTO {
    name: string;
    bannerImageUrls?: string[];
    isActive?: boolean;
    startDate?: string | null;
    expirationDate?: string | null;
    status?: string;
}

export interface UpdateCampaignDTO {
    name?: string;
    bannerImageUrls?: string[];
    isActive?: boolean;
    startDate?: string | null;
    expirationDate?: string | null;
    status?: string;
}
