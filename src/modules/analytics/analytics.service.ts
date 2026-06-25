import { AnalyticsEvent, MarketingSettings } from "./analytics.model.js";
import { AnalyticsRepository } from "./analytics.repository.js";

export class AnalyticsService {
    private repository = new AnalyticsRepository();

    async trackEvent(event: AnalyticsEvent): Promise<AnalyticsEvent> {
        return this.repository.createEvent(event);
    }

    async getMarketingSettings(): Promise<MarketingSettings> {
        return this.repository.getMarketingSettings();
    }

    async updateMarketingSettings(settings: MarketingSettings): Promise<MarketingSettings> {
        return this.repository.updateMarketingSettings(settings);
    }
}
