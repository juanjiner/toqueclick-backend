import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { Faq } from "./faq.model.js";

const pool = getPool();

export class FaqRepository {

    async findAll(): Promise<Faq[]> {

        const result = await pool.query(
            "SELECT * FROM toque.faqs"
        );

        return toCamelCase(result.rows);
    }

    async create(faq: Faq): Promise<Faq> {
        const result = await pool.query(
            `
        INSERT INTO toque.faqs 
        (category_id, question, answer) 
        VALUES ($1,$2,$3)
        RETURNING *
        `,
            [faq.categoryId, faq.question, faq.answer]
        );

        return toCamelCase(result.rows[0]);
    }

    async update(id: string, faq: Faq): Promise<Faq | null> {
        const result = await pool.query(
            `
        UPDATE toque.faqs
        SET 
            category_id=$1,
            question=$2,
            answer=$3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id=$4
        RETURNING *
        `,
            [faq.categoryId, faq.question, faq.answer, id]
        );

        return toCamelCase(result.rows[0] || null);
    }

    async delete(id: string): Promise<void> {
        await pool.query("DELETE FROM toque.faqs WHERE id=$1", [id]);
    }
}