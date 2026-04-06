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
}