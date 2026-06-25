import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { AnalyticsEvent, MarketingSettings } from "./analytics.model.js";

export class AnalyticsRepository {

    async createEvent(event: AnalyticsEvent): Promise<AnalyticsEvent> {
        const result = await getPool().query(
            `
            INSERT INTO toque.analytics_events 
            (visitor_id, session_id, event_type, page_path, referrer, channel, user_agent, ip_address,
             visitor_city, visitor_region, visitor_country, visitor_lat, visitor_lon) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
            `,
            [
                event.visitorId,
                event.sessionId,
                event.eventType,
                event.pagePath,
                event.referrer || null,
                event.channel || null,
                event.userAgent || null,
                event.ipAddress || null,
                event.visitorCity || null,
                event.visitorRegion || null,
                event.visitorCountry || null,
                event.visitorLat || null,
                event.visitorLon || null
            ]
        );

        return toCamelCase(result.rows[0]);
    }

    async getGeoCache(ip: string): Promise<any> {
        const result = await getPool().query(
            "SELECT city, region, country, lat, lon FROM toque.ip_geo_cache WHERE ip = $1",
            [ip]
        );
        return result.rows[0] ? toCamelCase(result.rows[0]) : null;
    }

    async saveGeoCache(ip: string, geo: { city: string; region: string; country: string; lat: number; lon: number }): Promise<void> {
        await getPool().query(
            `
            INSERT INTO toque.ip_geo_cache (ip, city, region, country, lat, lon, resolved_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (ip) DO UPDATE SET
                city = EXCLUDED.city,
                region = EXCLUDED.region,
                country = EXCLUDED.country,
                lat = EXCLUDED.lat,
                lon = EXCLUDED.lon,
                resolved_at = NOW()
            `,
            [ip, geo.city, geo.region, geo.country, geo.lat, geo.lon]
        );
    }

    async getGeoHeatmap(from: string, to: string): Promise<any[]> {
        const result = await getPool().query(
            `
            SELECT 
                visitor_city AS city, 
                visitor_lat AS lat, 
                visitor_lon AS lon, 
                COUNT(*) AS visits
            FROM toque.analytics_events
            WHERE created_at >= $1 AND created_at <= $2 
              AND visitor_city IS NOT NULL 
              AND visitor_lat IS NOT NULL
            GROUP BY visitor_city, visitor_lat, visitor_lon
            ORDER BY visits DESC
            `,
            [from, to]
        );
        return result.rows.map(row => toCamelCase(row));
    }

    async getMarketingSettings(): Promise<MarketingSettings> {
        const result = await getPool().query(
            "SELECT * FROM toque.marketing_settings WHERE id = 'current'"
        );
        
        // Si por alguna razón no existe, devolver valores por defecto
        if (result.rows.length === 0) {
            return {
                monthlyBudget: 1000.00,
                avgOpportunityValue: 500.00
            };
        }

        return toCamelCase(result.rows[0]);
    }

    async updateMarketingSettings(settings: MarketingSettings): Promise<MarketingSettings> {
        const result = await getPool().query(
            `
            INSERT INTO toque.marketing_settings (id, monthly_budget, avg_opportunity_value, updated_at)
            VALUES ('current', $1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (id) 
            DO UPDATE SET 
                monthly_budget = EXCLUDED.monthly_budget,
                avg_opportunity_value = EXCLUDED.avg_opportunity_value,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
            `,
            [settings.monthlyBudget, settings.avgOpportunityValue]
        );

        return toCamelCase(result.rows[0]);
    }
}
