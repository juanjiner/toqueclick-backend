export interface AnalyticsEvent {
    id?: string;
    visitorId: string;
    sessionId: string;
    eventType: 'pageview' | 'whatsapp_click' | 'phone_click' | 'lead_form_submit' | 'scroll_depth' | 'cta_click';
    pagePath: string;
    referrer?: string;
    channel?: string;
    userAgent?: string;
    ipAddress?: string;
    visitorCity?: string;
    visitorRegion?: string;
    visitorCountry?: string;
    visitorLat?: number;
    visitorLon?: number;
    businessId?: string;
    eventMetadata?: any;
    createdAt?: Date;
}

export interface MarketingSettings {
    id?: string;
    monthlyBudget: number;
    avgOpportunityValue: number;
    updatedAt?: Date;
}
