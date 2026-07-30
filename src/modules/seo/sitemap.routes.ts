import { Router } from 'express';
import { SitemapController } from './sitemap.controller.js';

const router = Router();
const controller = new SitemapController();

router.get('/sitemap.xml', controller.generateSitemap);

export default router;
