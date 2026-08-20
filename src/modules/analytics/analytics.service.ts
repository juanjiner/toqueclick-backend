import { AnalyticsEvent, MarketingSettings } from "./analytics.model.js";
import { AnalyticsRepository } from "./analytics.repository.js";

function isPrivateIp(ip: string): boolean {
    if (!ip) return true;
    const cleanIp = ip.trim();
    if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') return true;
    if (cleanIp.startsWith('10.') || cleanIp.startsWith('192.168.')) return true;
    if (cleanIp.startsWith('172.')) {
        const parts = cleanIp.split('.');
        if (parts.length >= 2) {
            const secondPart = parseInt(parts[1], 10);
            if (secondPart >= 16 && secondPart <= 31) return true;
        }
    }
    return false;
}

export class AnalyticsService {
    private repository = new AnalyticsRepository();

    async trackEvent(event: AnalyticsEvent): Promise<AnalyticsEvent> {
        const ip = event.ipAddress || '';
        
        if (ip && !isPrivateIp(ip)) {
            try {
                // 1. Consultar cache en BD
                const cached = await this.repository.getGeoCache(ip);
                if (cached) {
                    event.visitorCity = cached.city;
                    event.visitorRegion = cached.region;
                    event.visitorCountry = cached.country;
                    event.visitorLat = cached.lat ? Number(cached.lat) : undefined;
                    event.visitorLon = cached.lon ? Number(cached.lon) : undefined;
                } else {
                    // 2. Resolver llamando a ip-api.com con timeout de 2 segundos para no demorar la ingesta
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2000);
                    
                    const url = `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon&lang=es`;
                    const response = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    
                    if (response.ok) {
                        const data = await response.json() as any;
                        if (data && data.status === 'success') {
                            const geo = {
                                city: data.city || '',
                                region: data.regionName || '',
                                country: data.country || '',
                                lat: typeof data.lat === 'number' ? data.lat : 0,
                                lon: typeof data.lon === 'number' ? data.lon : 0
                            };
                            
                            // Guardar en cache de manera asíncrona para no bloquear
                            this.repository.saveGeoCache(ip, geo).catch(err => {
                                console.error("Error saving geo cache:", err);
                            });
                            
                            event.visitorCity = geo.city;
                            event.visitorRegion = geo.region;
                            event.visitorCountry = geo.country;
                            event.visitorLat = geo.lat;
                            event.visitorLon = geo.lon;
                        }
                    }
                }
            } catch (err) {
                console.error(`Failed to geocode IP ${ip}:`, err);
            }
        }

        return this.repository.createEvent(event);
    }

    async getGeoHeatmap(from: string, to: string): Promise<any[]> {
        return this.repository.getGeoHeatmap(from, to);
    }

    async getMarketingSettings(): Promise<MarketingSettings> {
        return this.repository.getMarketingSettings();
    }

    async updateMarketingSettings(settings: MarketingSettings): Promise<MarketingSettings> {
        return this.repository.updateMarketingSettings(settings);
    }

    async getBehavioralData(from: string, to: string) {
        const [summary, topPages, avgTimeByPage, bounceRateByPage, trafficByCategory, trafficByRegion, trafficTrend, funnel, scrollDepth, ctaClicks, leadsTrend, landingPerformance, leadChannels, landingBounceRate, campaignPerformance, campaignBusinessClicks, campaignsTrend, campaignRegions] =
            await Promise.all([
                this.repository.getBehavioralSummary(from, to),
                this.repository.getTopPages(from, to),
                this.repository.getAvgTimeByPage(from, to),
                this.repository.getBounceRateByPage(from, to),
                this.repository.getTrafficByCategory(from, to),
                this.repository.getTrafficByRegion(from, to),
                this.repository.getTrafficTrend(from, to),
                this.repository.getFunnelData(from, to),
                this.repository.getScrollDepthByPage(from, to),
                this.repository.getCtaClicks(from, to),
                this.repository.getLeadsTrend(from, to),
                this.repository.getLandingPerformance(from, to),
                this.repository.getLeadChannels(from, to),
                this.repository.getLandingBounceRate(from, to),
                this.repository.getCampaignMetrics(from, to),
                this.repository.getCampaignBusinessClicks(from, to),
                this.repository.getCampaignsTrend(from, to),
                this.repository.getCampaignRegions(from, to)
            ]);

        return { summary, topPages, avgTimeByPage, bounceRateByPage, trafficByCategory, trafficByRegion, trafficTrend, funnel, scrollDepth, ctaClicks, leadsTrend, landingPerformance, leadChannels, landingBounceRate, campaignPerformance, campaignBusinessClicks, campaignsTrend, campaignRegions };
    }

    async getCampaignPerformance(from: string, to: string) {
        return this.repository.getCampaignMetrics(from, to);
    }
}
