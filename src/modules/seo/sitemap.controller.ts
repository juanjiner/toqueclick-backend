import { Request, Response, NextFunction } from 'express';
import { SitemapService } from './sitemap.service.js';

export class SitemapController {
    private sitemapService = new SitemapService();

    generateSitemap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const baseUrl = req.protocol + '://' + req.get('host');
            // Hardcode to the expected frontend base URL if you prefer, or use env variable
            const frontendUrl = process.env.FRONTEND_URL || 'https://toqueclick.com';
            
            const xml = await this.sitemapService.generateSitemap(frontendUrl);
            
            res.header('Content-Type', 'application/xml');
            res.send(xml);
        } catch (error) {
            next(error);
        }
    };
}
