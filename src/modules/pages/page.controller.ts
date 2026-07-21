import { Request, Response } from 'express';
import { successResponse } from '../../utils/apiResponse.js';
import { PageService } from './page.service.js';

export class PageController {
    private service = new PageService();

    getAll = async (req: Request, res: Response) => {
        const pages = await this.service.getAll();
        res.json(successResponse(pages));
    };

    getBySlug = async (req: Request, res: Response) => {
        const page = await this.service.getBySlug(String(req.params.slug));
        res.json(successResponse(page));
    };

    getByCategory = async (req: Request, res: Response) => {
        const pages = await this.service.getByCategory(String(req.params.category));
        res.json(successResponse(pages));
    };

    createPage = async (req: Request, res: Response) => {
        const page = await this.service.createPage(req.body);
        res.status(201).json(successResponse(page));
    };

    updatePage = async (req: Request, res: Response) => {
        const page = await this.service.updatePage(String(req.params.slug), req.body);
        res.json(successResponse(page));
    };

    upsertSection = async (req: Request, res: Response) => {
        const section = await this.service.upsertSection(
            String(req.params.slug),
            req.body,
            req.file
        );
        res.json(successResponse(section));
    };

    deleteSection = async (req: Request, res: Response) => {
        await this.service.deleteSection(String(req.params.id));
        res.json(successResponse(null, 'Sección eliminada exitosamente'));
    };

    reorderSections = async (req: Request, res: Response) => {
        await this.service.reorderSections(req.body.sections);
        res.json(successResponse(null, 'Secciones reordenadas exitosamente'));
    };

    createItem = async (req: Request, res: Response) => {
        const item = await this.service.createItem(
            String(req.params.slug),
            String(req.params.sectionKey),
            req.body,
            req.file
        );
        res.status(201).json(successResponse(item));
    };

    updateItem = async (req: Request, res: Response) => {
        const item = await this.service.updateItem(
            String(req.params.id),
            req.body,
            req.file
        );
        res.json(successResponse(item));
    };

    deleteItem = async (req: Request, res: Response) => {
        await this.service.deleteItem(String(req.params.id));
        res.status(204).send();
    };

    reorderItems = async (req: Request, res: Response) => {
        await this.service.reorderItems(req.body);
        res.json(successResponse({ message: 'Items reordenados correctamente' }));
    };

    createFeature = async (req: Request, res: Response) => {
        const feature = await this.service.createFeature(String(req.params.itemId), req.body);
        res.status(201).json(successResponse(feature));
    };

    deleteFeature = async (req: Request, res: Response) => {
        await this.service.deleteFeature(String(req.params.id));
        res.status(204).send();
    };
}