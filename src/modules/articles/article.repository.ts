import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { Article } from "./article.model.js";

export class ArticleRepository {

    async findAll(): Promise<Article[]> {
        const result = await getPool().query("SELECT * FROM toque.blog_articles ORDER BY date desc");
        return toCamelCase(result.rows);
    }

    async findById(id: string): Promise<Article | null> {
        const result = await getPool().query(
            "SELECT * FROM toque.blog_articles WHERE id=$1",
            [id]
        );

        return toCamelCase(result.rows[0] || null);
    }

    async findBySlug(slug: string): Promise<Article | null> {
        const result = await getPool().query(
            "SELECT * FROM toque.blog_articles WHERE slug=$1",
            [slug]
        );

        return toCamelCase(result.rows[0] || null);
    }

    async create(article: Article): Promise<Article> {
        const result = await getPool().query(
            `
            INSERT INTO toque.blog_articles 
            (slug, title, image_url, category_id, author, date, content, tags, published, audio_url, video_url) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *
            `,
            [article.slug, article.title, article.imageUrl, article.categoryId, article.author, article.date,
            article.content, article.tags, article.published, article.audioUrl, article.videoUrl]
        );

        return toCamelCase(result.rows[0]);
    }

    async update(id: string, article: Article): Promise<Article | null> {
        const result = await getPool().query(
            `
            UPDATE toque.blog_articles
            SET 
                slug=$1,
                title=$2,
                image_url=$3,
                category_id=$4,
                author=$5,
                date=$6,
                content=$7,
                tags=$8,
                published=$9,
                audio_url=$10,
                video_url=$11,
                updated_at = CURRENT_TIMESTAMP
            WHERE id=$12
            RETURNING *
            `,
            [article.slug, article.title, article.imageUrl, article.categoryId, article.author, article.date,
            article.content, article.tags, article.published, article.audioUrl, article.videoUrl, id]
        );

        return toCamelCase(result.rows[0] || null);
    }

    async delete(id: string): Promise<void> {
        await getPool().query("DELETE FROM toque.blog_articles WHERE id=$1", [id]);
    }
}