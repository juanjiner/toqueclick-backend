import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { CreateLeadDTO, LeadDB } from "./lead.model.js";

export class LeadRepository {
    async createTableIfNotExists(): Promise<void> {
        await getPool().query(`
            CREATE TABLE IF NOT EXISTS toque.leads (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                page_id UUID NOT NULL REFERENCES toque.pages(id) ON DELETE CASCADE,
                form_data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async create(dto: CreateLeadDTO): Promise<LeadDB> {
        const result = await getPool().query(
            `INSERT INTO toque.leads (page_id, form_data)
             VALUES ($1, $2)
             RETURNING *`,
            [dto.pageId, JSON.stringify(dto.formData)]
        );
        return toCamelCase(result.rows[0]);
    }

    async findAllByPage(pageId: string): Promise<LeadDB[]> {
        const result = await getPool().query(
            `SELECT * FROM toque.leads
             WHERE page_id = $1
             ORDER BY created_at DESC`,
            [pageId]
        );
        return toCamelCase(result.rows);
    }

    async findAll(): Promise<LeadDB[]> {
        const result = await getPool().query(
            `SELECT l.*, p.name as page_name, p.slug as page_slug 
             FROM toque.leads l
             JOIN toque.pages p ON l.page_id = p.id
             ORDER BY l.created_at DESC`
        );
        return toCamelCase(result.rows);
    }
}
