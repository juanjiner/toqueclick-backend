export interface CampaignBanner {
    id?: string;
    campaignId?: string;
    businessId: string;
    imageUrl: string;
    title?: string;
    ctaText?: string;
    isActive?: boolean;
}

export interface Campaign {
    id: string;
    name: string;
    banners: CampaignBanner[];
    isActive: boolean;
    startDate: Date | null;
    expirationDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCampaignDTO {
    name: string;
    banners?: CampaignBanner[];
    isActive?: boolean;
    startDate?: string | null;
    expirationDate?: string | null;
    status?: string;
}

export interface UpdateCampaignDTO {
    name?: string;
    banners?: CampaignBanner[];
    isActive?: boolean;
    startDate?: string | null;
    expirationDate?: string | null;
    status?: string;
}
