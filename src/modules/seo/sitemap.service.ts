import { getPool } from '../../config/database.js';

export class SitemapService {
    
    async generateSitemap(baseUrl: string): Promise<string> {
        const pool = getPool();

        const pagesResult = await pool.query(
            `SELECT slug, updated_at FROM toque.pages WHERE published = true`
        );
        const pages = pagesResult.rows;

        const articlesResult = await pool.query(
            `SELECT id, updated_at FROM toque.blog_articles WHERE published = true`
        );
        const articles = articlesResult.rows;

        const promosResult = await pool.query(
            `SELECT id, updated_at FROM toque.promotions WHERE expiration_date >= NOW()`
        );
        const promos = promosResult.rows;

        const campaignsResult = await pool.query(
            `SELECT id, updated_at FROM toque.campaigns WHERE status = 'ACTIVA'`
        );
        const campaigns = campaignsResult.rows;

        const today = new Date().toISOString().split('T')[0];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        xml += this.buildUrlEntry(baseUrl, today, 'daily', '1.0');

        for (const page of pages) {
            const lastMod = page.updated_at ? new Date(page.updated_at).toISOString().split('T')[0] : today;
            xml += this.buildUrlEntry(`${baseUrl}/l/${page.slug}`, lastMod, 'weekly', '0.9');
        }

        for (const article of articles) {
            const lastMod = article.updated_at ? new Date(article.updated_at).toISOString().split('T')[0] : today;
            xml += this.buildUrlEntry(`${baseUrl}/blog/${article.id}`, lastMod, 'monthly', '0.7');
        }

        for (const promo of promos) {
            const lastMod = promo.updated_at ? new Date(promo.updated_at).toISOString().split('T')[0] : today;
            xml += this.buildUrlEntry(`${baseUrl}/promos#${promo.id}`, lastMod, 'weekly', '0.8');
        }

        for (const campaign of campaigns) {
            const lastMod = campaign.updated_at ? new Date(campaign.updated_at).toISOString().split('T')[0] : today;
            xml += this.buildUrlEntry(`${baseUrl}/campanas#${campaign.id}`, lastMod, 'weekly', '0.8');
        }

        xml += `</urlset>`;
        
        return xml;
    }

    private buildUrlEntry(url: string, lastmod: string, changefreq: string, priority: string): string {
        return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
    }
}
