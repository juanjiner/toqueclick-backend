import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { BusinessCategory, FaqCategory, BlogCategory } from "./category.model.js";

export class CategoryRepository {

    async findBusinessCategories(): Promise<BusinessCategory[]> {
        const result = await getPool().query(
            "SELECT id, business_category FROM maestro.business_categories ORDER BY business_category");
        return toCamelCase(result.rows);
    }

    async create(business: BusinessCategory): Promise<BusinessCategory> {
            const result = await getPool().query(
                `
                INSERT INTO maestro.business_categories 
                (business_category) 
                VALUES ($1)
                RETURNING *
                `,
                [business.businessCategory]
            );
    
            return toCamelCase(result.rows[0]);
        }

    async findFaqCategories(): Promise<FaqCategory[]> {
        const result = await getPool().query(
            "SELECT id, faq_category FROM maestro.faq_categories ORDER BY faq_category");
        return toCamelCase(result.rows);
    }

    async findBlogCategories(): Promise<BlogCategory[]> {
        const result = await getPool().query(
            "SELECT id, blog_category FROM maestro.blog_categories ORDER BY blog_category");
        return toCamelCase(result.rows);
    }
}