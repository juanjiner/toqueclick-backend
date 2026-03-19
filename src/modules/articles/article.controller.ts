import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { ArticleService } from "./article.service.js";

export class ArticleController {

    private service = new ArticleService();

    getAll = async (_req: Request, res: Response) => {
        const articles = await this.service.getArticles();
        res.json(successResponse(articles));
    };

    create = async (req: Request, res: Response) => {
        const article = await this.service.createArticle(req.body);
        res.status(201).json(successResponse(article));
    };

    update = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const article = await this.service.updateArticle(id, req.body);

        if (!article) {
            throw new AppError("Artículo no encontrado", 404);
        }

        res.json(successResponse(article));
    };

    delete = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        await this.service.deleteArticle(id);
        res.status(204).send();
    };
}