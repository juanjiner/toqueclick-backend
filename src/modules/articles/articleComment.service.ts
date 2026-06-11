import { ArticleComment, CommentStatus } from "./articleComment.model.js";
import { ArticleCommentRepository } from "./articleComment.repository.js";

export class ArticleCommentService {
    private repository = new ArticleCommentRepository();

    async createComment(comment: ArticleComment): Promise<ArticleComment> {
        return await this.repository.create(comment);
    }

    async getCommentsByArticleId(articleId: string, deviceId: string | null): Promise<ArticleComment[]> {
        return await this.repository.findByArticleId(articleId, deviceId);
    }

    async getPendingComments(): Promise<ArticleComment[]> {
        return await this.repository.findAllPending();
    }

    async getAllComments(): Promise<ArticleComment[]> {
        return await this.repository.findAll();
    }

    async updateCommentStatus(id: string, status: CommentStatus): Promise<ArticleComment | null> {
        return await this.repository.updateStatus(id, status);
    }
}
