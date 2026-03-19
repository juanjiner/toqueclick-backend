import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { Article } from "./article.model.js";

const pool = getPool();

export class ArticleRepository {

    async findAll(): Promise<Article[]> {
        const result = await pool.query("SELECT * FROM toque.blog_articles ORDER BY id");
        return result.rows;
    }

    async findById(id: string): Promise<Article | null> {
        const result = await pool.query(
            "SELECT * FROM toque.blog_articles WHERE id=$1",
            [id]
        );

        return result.rows[0] || null;
    }

    async create(article: Article): Promise<Article> {
        const result = await pool.query(
            `
            INSERT INTO toque.blog_articles 
            (title, image_url, category_id, author, content) 
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *
            `,
            [article.title, article.imageUrl, article.categoryId, article.author,
            article.content]
        );

        return toCamelCase(result.rows[0]);
    }

    async update(id: string, article: Article): Promise<Article | null> {
        const result = await pool.query(
            `
            UPDATE toque.blog_articles
            SET 
                title=$1,
                image_url=$2,
                category_id=$3,
                author=$4,
                content=$5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id=$6
            RETURNING *
            `,
            [article.title, article.imageUrl, article.categoryId, article.author,
            article.content, id]
        );

        return toCamelCase(result.rows[0] || null);
    }

    async delete(id: string): Promise<void> {
        await pool.query("DELETE FROM toque.blog_articles WHERE id=$1", [id]);
    }
}