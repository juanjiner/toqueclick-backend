export interface AnalyticsEvent {
    id?: string;
    visitorId: string;
    sessionId: string;
    eventType: 'pageview' | 'whatsapp_click' | 'phone_click' | 'lead_form_submit';
    pagePath: string;
    referrer?: string;
    channel?: string;
    userAgent?: string;
    ipAddress?: string;
    createdAt?: Date;
}

export interface MarketingSettings {
    id?: string;
    monthlyBudget: number;
    avgOpportunityValue: number;
    updatedAt?: Date;
}
