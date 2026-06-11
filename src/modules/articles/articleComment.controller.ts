import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { ArticleCommentService } from "./articleComment.service.js";
import { CommentStatus } from "./articleComment.model.js";

export class ArticleCommentController {
    private service = new ArticleCommentService();

    create = async (req: Request, res: Response) => {
        const articleId = String(req.params.id);
        const { authorName, authorEmail, content } = req.body;
        const deviceId = req.header('X-Device-Id') || req.body.deviceId;

        if (!deviceId) throw new AppError("Se requiere identificar el dispositivo del usuario (X-Device-Id)", 400);

        const comment = await this.service.createComment({
            articleId,
            authorName,
            authorEmail,
            content,
            deviceId,
            status: 'PENDING'
        });

        res.status(201).json(successResponse(comment));
    };

    getByArticle = async (req: Request, res: Response) => {
        const articleId = String(req.params.id);
        const deviceId = req.header('X-Device-Id') || (req.query.deviceId as string) || null;

        const comments = await this.service.getCommentsByArticleId(articleId, deviceId);
        res.json(successResponse(comments));
    };

    getPending = async (_req: Request, res: Response) => {
        const comments = await this.service.getPendingComments();
        res.json(successResponse(comments));
    };

    getAll = async (_req: Request, res: Response) => {
        const comments = await this.service.getAllComments();
        res.json(successResponse(comments));
    };

    updateStatus = async (req: Request, res: Response) => {
        const id = String(req.params.commentId);
        const { status } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            throw new AppError("El estado debe ser 'APPROVED' o 'REJECTED'", 400);
        }

        const data = await this.service.updateCommentStatus(id, status as CommentStatus);
        
        if (!data) throw new AppError("Comentario no encontrado", 404);

        res.json(successResponse(data));
    };
}
