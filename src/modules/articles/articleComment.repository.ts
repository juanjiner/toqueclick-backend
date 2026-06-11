import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { ArticleComment, CommentStatus } from "./articleComment.model.js";

export class ArticleCommentRepository {
    async create(comment: ArticleComment): Promise<ArticleComment> {
        const result = await getPool().query(
            `
            INSERT INTO toque.blog_article_comments 
            (article_id, author_name, author_email, content, status, device_id) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                comment.articleId,
                comment.authorName,
                comment.authorEmail,
                comment.content,
                comment.status || 'PENDING',
                comment.deviceId
            ]
        );
        return toCamelCase(result.rows[0]);
    }

    async findByArticleId(articleId: string, deviceId: string | null): Promise<ArticleComment[]> {
        let query = `
            SELECT * FROM toque.blog_article_comments
            WHERE article_id = $1 AND (status = 'APPROVED'
        `;
        const params: any[] = [articleId];

        if (deviceId) {
            query += ` OR (status = 'PENDING' AND device_id = $2)`;
            params.push(deviceId);
        }

        query += `) ORDER BY created_at DESC`;

        const result = await getPool().query(query, params);
        return toCamelCase(result.rows);
    }

    async findAllPending(): Promise<ArticleComment[]> {
        const result = await getPool().query(
            `SELECT * FROM toque.blog_article_comments WHERE status = 'PENDING' ORDER BY created_at ASC`
        );
        return toCamelCase(result.rows);
    }

    async findAll(): Promise<ArticleComment[]> {
        const result = await getPool().query(
            `SELECT * FROM toque.blog_article_comments ORDER BY created_at DESC`
        );
        return toCamelCase(result.rows);
    }

    async updateStatus(id: string, status: CommentStatus): Promise<ArticleComment | null> {
        const result = await getPool().query(
            `
            UPDATE toque.blog_article_comments
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
            `,
            [status, id]
        );
        return toCamelCase(result.rows[0] || null);
    }
}
