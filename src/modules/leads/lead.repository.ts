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
                status VARCHAR(20) DEFAULT 'pendiente',
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

    async findAllByPage(pageId: string, status?: string): Promise<LeadDB[]> {
        let query = `SELECT * FROM toque.leads WHERE page_id = $1`;
        const params: any[] = [pageId];
        if (status) {
            query += ` AND COALESCE(status, 'pendiente') = $2`;
            params.push(status);
        }
        query += ` ORDER BY created_at DESC`;
        
        const result = await getPool().query(query, params);
        return toCamelCase(result.rows);
    }

    async findAll(status?: string): Promise<LeadDB[]> {
        let query = `SELECT l.*, p.name as page_name, p.slug as page_slug 
             FROM toque.leads l
             JOIN toque.pages p ON l.page_id = p.id`;
        const params: any[] = [];
        if (status) {
            query += ` WHERE COALESCE(l.status, 'pendiente') = $1`;
            params.push(status);
        }
        query += ` ORDER BY l.created_at DESC`;

        const result = await getPool().query(query, params);
        return toCamelCase(result.rows);
    }

    async updateStatus(id: string, status: string): Promise<LeadDB> {
        const result = await getPool().query(
            `UPDATE toque.leads SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );
        return toCamelCase(result.rows[0]);
    }
}
