import { getPool } from "../../config/database.js";

export class DashboardRepository {

    async getStats() {
        const result = await getPool().query(`
      SELECT
        (SELECT COUNT(*) FROM toque.promotions  WHERE expiration_date > NOW())   AS active_promos,
        (SELECT COUNT(*) FROM toque.businesses  WHERE status = 'APROBADO')       AS approved_businesses,
        (SELECT COUNT(*) FROM toque.blog_articles WHERE published = true)        AS published_articles,
        (SELECT COUNT(*) FROM toque.faqs)                                        AS total_faqs
    `);
        return result.rows[0];
    }

    async getRecentActivity() {
        const result = await getPool().query(`
      SELECT
        (SELECT created_at FROM toque.promotions   ORDER BY created_at DESC LIMIT 1) AS last_promo,
        (SELECT created_at FROM toque.businesses   WHERE status = 'APROBADO'
                                                   ORDER BY updated_at DESC LIMIT 1) AS last_business,
        (SELECT created_at FROM toque.blog_articles WHERE published = true
                                                   ORDER BY created_at DESC LIMIT 1) AS last_article,
        (SELECT created_at FROM toque.faqs         ORDER BY created_at DESC LIMIT 1) AS last_faq
    `);
        return result.rows[0];
    }

    async getTopPromos() {
        const result = await getPool().query(`
      SELECT title, views
      FROM toque.promotions
      WHERE expiration_date > NOW()
      ORDER BY views DESC
      LIMIT 5
    `);
        return result.rows;
    }

    async getTopCities() {
        const result = await getPool().query(`
      SELECT d.departament AS city, COUNT(p.id) AS total
      FROM toque.promotions p
      JOIN maestro.departament d ON d.id = p.city_id
      WHERE p.expiration_date > NOW()
      GROUP BY d.departament
      ORDER BY total DESC
      LIMIT 5
    `);
        return result.rows;
    }

    async getExecutiveStats() {
        const pool = getPool();

        // 1. Queries de Tráfico y Conversiones
        const trafficPromise = pool.query(`
            SELECT
                (SELECT COUNT(DISTINCT visitor_id) FROM toque.analytics_events WHERE created_at >= DATE_TRUNC('month', NOW())) AS visitors_current,
                (SELECT COUNT(DISTINCT visitor_id) FROM toque.analytics_events WHERE created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', NOW())) AS visitors_prev,
                
                (SELECT COUNT(DISTINCT visitor_id) 
                 FROM toque.analytics_events 
                 WHERE created_at >= DATE_TRUNC('month', NOW()) 
                 AND visitor_id NOT IN (
                     SELECT visitor_id FROM toque.analytics_events WHERE created_at < DATE_TRUNC('month', NOW())
                 )) AS new_visitors_current,
                
                (SELECT COUNT(*) FROM toque.business_registrations WHERE created_at >= DATE_TRUNC('month', NOW())) AS forms_current,
                (SELECT COUNT(*) FROM toque.business_registrations WHERE created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', NOW())) AS forms_prev,
                
                (SELECT COUNT(*) FROM toque.analytics_events WHERE event_type = 'quote_request' AND created_at >= DATE_TRUNC('month', NOW())) AS quotes_current,
                (SELECT COUNT(*) FROM toque.analytics_events WHERE event_type = 'quote_request' AND created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', NOW())) AS quotes_prev,

                (SELECT COUNT(*) FROM toque.analytics_events WHERE event_type = 'whatsapp_click' AND created_at >= DATE_TRUNC('month', NOW())) AS wa_current,
                (SELECT COUNT(*) FROM toque.analytics_events WHERE event_type = 'whatsapp_click' AND created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', NOW())) AS wa_prev,
                
                (SELECT COUNT(*) FROM toque.analytics_events WHERE event_type = 'phone_click' AND created_at >= DATE_TRUNC('month', NOW())) AS phone_current,
                (SELECT COUNT(*) FROM toque.analytics_events WHERE event_type = 'phone_click' AND created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', NOW())) AS phone_prev
        `);

        // 2. Query de Calidad
        const qualityPromise = pool.query(`
            SELECT
                COALESCE((
                    SELECT AVG(duration) FROM (
                        SELECT session_id, EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) AS duration
                        FROM toque.analytics_events
                        WHERE created_at >= DATE_TRUNC('month', NOW())
                        GROUP BY session_id
                    ) s
                ), 0) AS avg_duration,
                
                COALESCE((
                    SELECT COUNT(CASE WHEN event_type = 'pageview' THEN 1 END)::FLOAT / NULLIF(COUNT(DISTINCT session_id), 0)
                    FROM toque.analytics_events
                    WHERE created_at >= DATE_TRUNC('month', NOW())
                ), 0) AS pageviews_per_session,
                
                COALESCE((
                    WITH session_stats AS (
                        SELECT session_id, COUNT(*) AS event_count, EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) AS duration
                        FROM toque.analytics_events
                        WHERE created_at >= DATE_TRUNC('month', NOW())
                        GROUP BY session_id
                    )
                    SELECT COUNT(CASE WHEN event_count = 1 AND duration < 10 THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) * 100
                    FROM session_stats
                ), 0) AS bounce_rate
        `);

        // 3. Query de Tendencia (últimos 12 meses)
        const trendPromise = pool.query(`
            SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(DISTINCT visitor_id) AS visitors, COUNT(*) AS pageviews
            FROM toque.analytics_events
            WHERE created_at >= NOW() - INTERVAL '12 months'
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
            ORDER BY month ASC
        `);

        // 4. Query de Canales de Captación
        const channelsPromise = pool.query(`
            SELECT COALESCE(channel, 'Direct') AS channel, COUNT(DISTINCT visitor_id) AS visitors
            FROM toque.analytics_events
            WHERE created_at >= DATE_TRUNC('month', NOW())
            GROUP BY COALESCE(channel, 'Direct')
            ORDER BY visitors DESC
        `);

        // 5. Query de Ajustes de Marketing (presupuesto y costo de lead)
        const marketingPromise = pool.query(`
            SELECT monthly_budget, avg_opportunity_value FROM toque.marketing_settings WHERE id = 'current'
        `);

        // 6. Query de Top Páginas
        const topPagesPromise = pool.query(`
            SELECT page_path AS path, COUNT(*) AS views
            FROM toque.analytics_events
            WHERE created_at >= DATE_TRUNC('month', NOW()) AND event_type = 'pageview'
            GROUP BY page_path
            ORDER BY views DESC
            LIMIT 5
        `);

        // 7. Query de Top Ciudades (Map)
        const topCitiesPromise = pool.query(`
            SELECT visitor_city AS city, COUNT(DISTINCT visitor_id) AS total
            FROM toque.analytics_events
            WHERE created_at >= DATE_TRUNC('month', NOW()) AND visitor_city IS NOT NULL
            GROUP BY visitor_city
            ORDER BY total DESC
            LIMIT 5
        `);

        const [trafficRes, qualityRes, trendRes, channelsRes, marketingRes, topPagesRes, topCitiesRes] = await Promise.all([
            trafficPromise,
            qualityPromise,
            trendPromise,
            channelsPromise,
            marketingPromise,
            topPagesPromise,
            topCitiesPromise
        ]);

        const traffic = trafficRes.rows[0];
        const quality = qualityRes.rows[0];
        const trend = trendRes.rows;
        const channels = channelsRes.rows;
        const marketing = marketingRes.rows[0] || { monthly_budget: 1000.00, avg_opportunity_value: 500.00 };
        const topPages = topPagesRes.rows;
        const topCities = topCitiesRes.rows;

        // Procesar Rentabilidad
        const budget = Number(marketing.monthly_budget);
        const opportunityVal = Number(marketing.avg_opportunity_value);

        const visitorsCurrent = Number(traffic.visitors_current);
        const visitorsPrev = Number(traffic.visitors_prev);
        const newVisitorsCurrent = Number(traffic.new_visitors_current);
        const returningVisitorsCurrent = visitorsCurrent - newVisitorsCurrent;

        const formsCurrent = Number(traffic.forms_current);
        const formsPrev = Number(traffic.forms_prev);
        const waCurrent = Number(traffic.wa_current);
        const waPrev = Number(traffic.wa_prev);
        const phoneCurrent = Number(traffic.phone_current);
        const phonePrev = Number(traffic.phone_prev);
        const quotesCurrent = Number(traffic.quotes_current);
        const quotesPrev = Number(traffic.quotes_prev);

        const totalLeadsCurrent = formsCurrent + waCurrent + phoneCurrent + quotesCurrent;
        const totalLeadsPrev = formsPrev + waPrev + phonePrev + quotesPrev;

        const cpl = totalLeadsCurrent > 0 ? (budget / totalLeadsCurrent) : 0;
        const estOpportunitiesValue = totalLeadsCurrent * opportunityVal;
        const roi = budget > 0 ? (((estOpportunitiesValue - budget) / budget) * 100) : 0;
        const bounceRate = Math.round(Number(quality.bounce_rate) * 10) / 10;
        const interactionRate = Math.max(0, 100 - bounceRate);

        return {
            traffic: {
                visitorsCurrent,
                visitorsPrev,
                newVisitorsCurrent,
                returningVisitorsCurrent,
                formsCurrent,
                formsPrev,
                quotesCurrent,
                quotesPrev,
                waCurrent,
                waPrev,
                phoneCurrent,
                phonePrev,
                totalLeadsCurrent,
                totalLeadsPrev
            },
            quality: {
                avgDuration: Math.round(Number(quality.avg_duration)),
                pageviewsPerSession: Math.round(Number(quality.pageviews_per_session) * 10) / 10,
                bounceRate,
                interactionRate
            },
            trend: trend.map(t => ({
                month: t.month,
                visitors: Number(t.visitors),
                pageviews: Number(t.pageviews)
            })),
            channels: channels.map(c => ({
                name: c.channel,
                visitors: Number(c.visitors)
            })),
            profitability: {
                monthlyBudget: budget,
                avgOpportunityValue: opportunityVal,
                cpl: Math.round(cpl * 100) / 100,
                estOpportunitiesValue,
                roi: Math.round(roi * 10) / 10
            },
            topPages: topPages.map(p => ({
                path: p.path || '/',
                views: Number(p.views)
            })),
            topCities: topCities.map(c => ({
                city: c.city,
                total: Number(c.total)
            }))
        };
    }
}