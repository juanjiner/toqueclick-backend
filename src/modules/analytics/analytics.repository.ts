import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { AnalyticsEvent, MarketingSettings } from "./analytics.model.js";

export class AnalyticsRepository {

    async createEvent(event: AnalyticsEvent): Promise<AnalyticsEvent> {
        const result = await getPool().query(
            `
            INSERT INTO toque.analytics_events 
            (visitor_id, session_id, event_type, page_path, referrer, channel, user_agent, ip_address) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
                event.ipAddress || null
            ]
        );

        return toCamelCase(result.rows[0]);
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
