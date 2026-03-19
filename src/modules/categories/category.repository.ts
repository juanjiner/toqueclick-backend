import { getPool } from "../../config/database.js";
import { BusinessCategory, FaqCategory, BlogCategory } from "./category.model.js";
const pool = getPool();

export class CategoryRepository {

    async findBusinessCategories(): Promise<BusinessCategory[]> {
        const result = await pool.query(
            "SELECT id, business_category FROM maestro.business_categories ORDER BY business_category");
        return result.rows;
    }

    async findFaqCategories(): Promise<FaqCategory[]> {
        const result = await pool.query(
            "SELECT id, faq_category FROM maestro.faq_categories ORDER BY faq_category");
        return result.rows;
    }

    async findBlogCategories(): Promise<BlogCategory[]> {
        const result = await pool.query(
            "SELECT id, blog_category FROM maestro.blog_categories ORDER BY blog_category");
        return result.rows;
    }
}