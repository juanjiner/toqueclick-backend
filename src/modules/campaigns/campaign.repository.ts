import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { Campaign, CreateCampaignDTO, UpdateCampaignDTO } from "./campaign.model.js";

export class CampaignRepository {

    async findAll(): Promise<Campaign[]> {
        const result = await getPool().query(
            "SELECT * FROM toque.campaigns ORDER BY created_at DESC"
        );
        return toCamelCase(result.rows);
    }

    async findById(id: string): Promise<Campaign | null> {
        const result = await getPool().query(
            "SELECT * FROM toque.campaigns WHERE id = $1",
            [id]
        );
        return result.rows.length ? toCamelCase(result.rows[0]) : null;
    }

    async create(data: CreateCampaignDTO): Promise<Campaign> {
        const result = await getPool().query(
            `INSERT INTO toque.campaigns 
            (name, cover_image_url, start_date, expiration_date, status) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [data.name, data.coverImageUrl || null, data.startDate || null, data.expirationDate || null, data.status || 'ACTIVA']
        );
        return toCamelCase(result.rows[0]);
    }

    async update(id: string, data: UpdateCampaignDTO): Promise<Campaign | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let index = 1;

        if (data.name !== undefined) {
            updates.push(`name = $${index++}`);
            values.push(data.name);
        }
        if (data.coverImageUrl !== undefined) {
            updates.push(`cover_image_url = $${index++}`);
            values.push(data.coverImageUrl);
        }
        if (data.startDate !== undefined) {
            updates.push(`start_date = $${index++}`);
            values.push(data.startDate);
        }
        if (data.expirationDate !== undefined) {
            updates.push(`expiration_date = $${index++}`);
            values.push(data.expirationDate);
        }
        if (data.status !== undefined) {
            updates.push(`status = $${index++}`);
            values.push(data.status);
        }

        if (updates.length === 0) return this.findById(id);

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE toque.campaigns 
            SET ${updates.join(", ")} 
            WHERE id = $${index} RETURNING *`;

        const result = await getPool().query(query, values);
        return result.rows.length ? toCamelCase(result.rows[0]) : null;
    }

    async delete(id: string): Promise<void> {
        await getPool().query("DELETE FROM toque.campaigns WHERE id = $1", [id]);
    }
}
