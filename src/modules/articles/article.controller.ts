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

    getById = async (_req: Request, res: Response) => {
        const article = await this.service.getById(String(_req.params.id))
        res.json(successResponse(article));
    };

    create = async (req: Request, res: Response) => {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const imageFile = files?.image?.[0];
        const audioFile = files?.audio?.[0];
        const videoFile = files?.video?.[0];

        const data = await this.service.createArticle(req.body, {
            image: imageFile,
            audio: audioFile,
            video: videoFile
        });
        res.status(201).json(successResponse(data));
    };

    update = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const imageFile = files?.image?.[0];
        const audioFile = files?.audio?.[0];
        const videoFile = files?.video?.[0];

        const data = await this.service.updateArticle(id, req.body, {
            image: imageFile,
            audio: audioFile,
            video: videoFile
        });

        if (!data) throw new AppError("Artículo no encontrado", 404);

        res.json(successResponse(data));
    };

    delete = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        await this.service.deleteArticle(id);
        res.status(204).send();
    };
}