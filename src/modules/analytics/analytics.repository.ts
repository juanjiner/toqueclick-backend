import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { AnalyticsEvent, MarketingSettings } from "./analytics.model.js";

export class AnalyticsRepository {

    async createEvent(event: AnalyticsEvent): Promise<AnalyticsEvent> {
        const result = await getPool().query(
            `
            INSERT INTO toque.analytics_events 
            (visitor_id, session_id, event_type, page_path, referrer, channel, user_agent, ip_address,
             visitor_city, visitor_region, visitor_country, visitor_lat, visitor_lon, business_id, event_metadata) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
                event.visitorLon || null,
                event.businessId || null,
                event.eventMetadata ? JSON.stringify(event.eventMetadata) : null
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
            WHERE created_at >= $1 AND created_at < $2::timestamp + interval '1 day' 
              AND visitor_city IS NOT NULL 
              AND visitor_lat IS NOT NULL
            GROUP BY visitor_city, visitor_lat, visitor_lon
            ORDER BY visits DESC
            `,
            [from, to]
        );
        return result.rows.map((row: any) => toCamelCase(row));
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

    async getTopPages(from: string, to: string): Promise<any[]> {
        const result = await getPool().query(
            `
            SELECT page_path AS "pagePath", COUNT(*) AS views
            FROM toque.analytics_events
            WHERE event_type = 'pageview' 
              AND created_at >= $1 AND created_at < $2::timestamp + interval '1 day'
            GROUP BY page_path
            ORDER BY views DESC
            LIMIT 10
            `,
            [from, to]
        );
        return result.rows.map((row: any) => toCamelCase(row));
    }

    async getAvgTimeByPage(from: string, to: string): Promise<any[]> {
        const result = await getPool().query(
            `
            SELECT page_path AS "pagePath", 
                   ROUND(AVG(duration)::numeric, 1) AS "avgTimeSeconds"
            FROM (
                SELECT page_path, session_id, 
                       EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) AS duration
                FROM toque.analytics_events
                WHERE created_at >= $1 AND created_at < $2::timestamp + interval '1 day'
                GROUP BY page_path, session_id
                HAVING COUNT(*) > 1
            ) sub
            WHERE duration <= 1800
            GROUP BY page_path
            ORDER BY "avgTimeSeconds" DESC
            LIMIT 10
            `,
            [from, to]
        );
        return result.rows.map((row: any) => toCamelCase(row));
    }

    async getBounceRateByPage(from: string, to: string): Promise<any[]> {
        const result = await getPool().query(
            `
            SELECT page_path AS "pagePath",
                   COUNT(*) AS "totalSessions",
                   COUNT(CASE WHEN event_count = 1 THEN 1 END) AS "bouncedSessions",
                   ROUND(
                       COUNT(CASE WHEN event_count = 1 THEN 1 END)::numeric / 
                       NULLIF(COUNT(*), 0) * 100, 1
                   ) AS "bounceRate"
            FROM (
                SELECT page_path, session_id, COUNT(*) AS event_count
                FROM toque.analytics_events
                WHERE created_at >= $1 AND created_at < $2::timestamp + interval '1 day'
                GROUP BY page_path, session_id
            ) sub
            GROUP BY page_path
            HAVING COUNT(*) >= 3
            ORDER BY "bounceRate" DESC
            LIMIT 10
            `,
            [from, to]
        );
        return result.rows.map((row: any) => toCamelCase(row));
    }

    async getTrafficByCategory(from: string, to: string): Promise<any[]> {
        const result = await getPool().query(
            `
            SELECT c.business_category AS "category", COUNT(*) AS visits
            FROM toque.analytics_events ae
            JOIN toque.businesses b ON b.id = ae.business_id
            JOIN maestro.business_categories c ON c.id = b.category_id
            WHERE ae.created_at >= $1 AND ae.created_at < $2::timestamp + interval '1 day'
              AND ae.business_id IS NOT NULL
            GROUP BY c.business_category
            ORDER BY visits DESC
            `,
            [from, to]
        );
        return result.rows.map((row: any) => toCamelCase(row));
    }

    async getTrafficByRegion(from: string, to: string): Promise<any[]> {
        const result = await getPool().query(
            `
            SELECT visitor_region AS "region", COUNT(*) AS visits
            FROM toque.analytics_events
            WHERE created_at >= $1 AND created_at < $2::timestamp + interval '1 day'
              AND visitor_region IS NOT NULL AND visitor_region != ''
            GROUP BY visitor_region
            ORDER BY visits DESC
            `,
            [from, to]
        );
        return result.rows.map((row: any) => toCamelCase(row));
    }

    async getTrafficTrend(from: string, to: string): Promise<any[]> {
        const result = await getPool().query(
            `
            SELECT TO_CHAR(created_at, 'YYYY-MM') AS month,
                   COUNT(DISTINCT visitor_id) AS visitors,
                   COUNT(*) AS pageviews
            FROM toque.analytics_events
            WHERE event_type = 'pageview'
              AND created_at >= $1 AND created_at < $2::timestamp + interval '1 day'
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
            ORDER BY month ASC
            `,
            [from, to]
        );
        return result.rows.map((row: any) => toCamelCase(row));
    }

    async getBehavioralSummary(from: string, to: string): Promise<any> {
        const result = await getPool().query(
            `
            SELECT 
                SUM(sub.event_count)::int AS "totalEvents",
                COUNT(DISTINCT sub.visitor_id)::int AS "uniqueVisitors",
                COUNT(DISTINCT sub.session_id)::int AS "totalSessions",
                COALESCE(ROUND(AVG(LEAST(sub.duration, 3600))::numeric, 1), 0) AS "avgSessionDuration"
            FROM (
                SELECT visitor_id, session_id,
                       COUNT(*) AS event_count,
                       EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) AS duration
                FROM toque.analytics_events
                WHERE created_at >= $1 AND created_at < $2::timestamp + interval '1 day'
                GROUP BY visitor_id, session_id
            ) sub
            `,
            [from, to]
        );
        return toCamelCase(result.rows[0]);
    }

    async getFunnelData(from: string, to: string): Promise<any> {
        const result = await getPool().query(
            `
            SELECT 
                COUNT(DISTINCT session_id) AS "totalVisits",
                COUNT(DISTINCT CASE WHEN event_type = 'scroll_depth' AND (event_metadata->>'depth')::int >= 50 THEN session_id END) AS "scroll50",
                COUNT(DISTINCT CASE WHEN event_type = 'cta_click' THEN session_id END) AS "ctaClicks"
            FROM toque.analytics_events
            WHERE created_at >= $1 AND created_at < $2::timestamp + interval '1 day'
            `,
            [from, to]
        );
        return toCamelCase(result.rows[0]);
    }

    async getScrollDepthByPage(from: string, to: string): Promise<any[]> {
        const result = await getPool().query(
            `
            SELECT 
                page_path AS "pagePath",
                ROUND(AVG(max_depth)::numeric, 1) AS "avgScrollDepth"
            FROM (
                SELECT page_path, session_id, MAX((event_metadata->>'depth')::int) AS max_depth
                FROM toque.analytics_events
                WHERE event_type = 'scroll_depth'
                  AND created_at >= $1 AND created_at < $2::timestamp + interval '1 day'
                GROUP BY page_path, session_id
            ) sub
            GROUP BY page_path
            ORDER BY "avgScrollDepth" DESC
            LIMIT 10
            `,
            [from, to]
        );
        return result.rows.map((row: any) => toCamelCase(row));
    }

    async getCtaClicks(from: string, to: string): Promise<any[]> {
        const result = await getPool().query(
            `
            SELECT 
                event_metadata->>'ctaName' AS "ctaName",
                COUNT(*) AS clicks
            FROM toque.analytics_events
            WHERE event_type = 'cta_click'
              AND created_at >= $1 AND created_at < $2::timestamp + interval '1 day'
              AND event_metadata->>'ctaName' IS NOT NULL
            GROUP BY event_metadata->>'ctaName'
            ORDER BY clicks DESC
            LIMIT 10
            `,
            [from, to]
        );
        return result.rows.map((row: any) => toCamelCase(row));
    }
}
