export interface Promotion {
    id?: string;
    businessNameId: string;
    cityId: string;
    title: string;
    description: string;
    promoPrice: number;
    originalPrice: number;
    promoTypeId: string;
    purchaseTypeId: string;
    expirationDate: Date;
    imageUrl: string;
    views?: number;
}

export interface PromoTypes {
    id: string;
    promo: string;
}

export interface PurchaseTypes {
    id: string;
    purchase: string;
}