import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { Campaign, CreateCampaignDTO, UpdateCampaignDTO } from "./campaign.model.js";

export class CampaignRepository {

    async findAll(activeOnly: boolean = false): Promise<Campaign[]> {
        let query = `
            SELECT c.*, 
                   COALESCE(json_agg(cb.*) FILTER (WHERE cb.id IS NOT NULL), '[]') as banners
            FROM toque.campaigns c
            LEFT JOIN toque.campaign_banners cb ON c.id = cb.campaign_id
        `;
        if (activeOnly) {
            query += " WHERE c.is_active = true";
        }
        query += " GROUP BY c.id ORDER BY c.created_at DESC";

        const result = await getPool().query(query);
        return toCamelCase(result.rows);
    }

    async findById(id: string): Promise<Campaign | null> {
        const query = `
            SELECT c.*, 
                   COALESCE(json_agg(cb.*) FILTER (WHERE cb.id IS NOT NULL), '[]') as banners
            FROM toque.campaigns c
            LEFT JOIN toque.campaign_banners cb ON c.id = cb.campaign_id
            WHERE c.id = $1
            GROUP BY c.id
        `;
        const result = await getPool().query(query, [id]);
        return result.rows.length ? toCamelCase(result.rows[0]) : null;
    }

    async create(data: CreateCampaignDTO): Promise<Campaign> {
        const client = await getPool().connect();
        let campaignId: string;
        try {
            await client.query('BEGIN');
            const result = await client.query(
                `INSERT INTO toque.campaigns 
                (name, is_active, start_date, expiration_date, status) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [data.name, data.isActive !== undefined ? data.isActive : true, data.startDate || null, data.expirationDate || null, data.status || 'ACTIVA']
            );
            campaignId = result.rows[0].id;

            if (data.banners && data.banners.length > 0) {
                for (const banner of data.banners) {
                    await client.query(
                        `INSERT INTO toque.campaign_banners 
                        (campaign_id, business_id, image_url, title, cta_text) 
                        VALUES ($1, $2, $3, $4, $5)`,
                        [campaignId, banner.businessId || null, banner.imageUrl, banner.title || null, banner.ctaText || null]
                    );
                }
            }
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
        return await this.findById(campaignId) as Campaign;
    }

    async update(id: string, data: UpdateCampaignDTO): Promise<Campaign | null> {
        const client = await getPool().connect();
        try {
            await client.query('BEGIN');
            const updates: string[] = [];
            const values: any[] = [];
            let index = 1;

            if (data.name !== undefined) {
                updates.push(`name = $${index++}`);
                values.push(data.name);
            }
            if (data.isActive !== undefined) {
                updates.push(`is_active = $${index++}`);
                values.push(data.isActive);
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

            if (updates.length > 0) {
                updates.push(`updated_at = CURRENT_TIMESTAMP`);
                values.push(id);
                await client.query(
                    `UPDATE toque.campaigns SET ${updates.join(", ")} WHERE id = $${index}`,
                    values
                );
            }

            if (data.banners !== undefined) {
                await client.query("DELETE FROM toque.campaign_banners WHERE campaign_id = $1", [id]);
                if (data.banners && data.banners.length > 0) {
                    for (const banner of data.banners) {
                        await client.query(
                            `INSERT INTO toque.campaign_banners 
                            (campaign_id, business_id, image_url, title, cta_text) 
                            VALUES ($1, $2, $3, $4, $5)`,
                            [id, banner.businessId || null, banner.imageUrl, banner.title || null, banner.ctaText || null]
                        );
                    }
                }
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
        return await this.findById(id);
    }

    async delete(id: string): Promise<void> {
        await getPool().query("DELETE FROM toque.campaigns WHERE id = $1", [id]);
    }
}
