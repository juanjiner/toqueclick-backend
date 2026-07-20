import { getPool } from '../../config/database.js';
import { toCamelCase } from '../../utils/camelCase.js';
import { Popup, CreatePopupDTO, UpdatePopupDTO } from './popup.model.js';

export class PopupRepository {

    async findAll(): Promise<Popup[]> {
        const result = await getPool().query(
            `SELECT id, title, description, icon, position, cta_text, cta_link, is_active, start_date, end_date, display_rules, created_at, updated_at
             FROM toque.popups ORDER BY created_at DESC`
        );
        return toCamelCase(result.rows);
    }

    async findById(id: string): Promise<Popup | null> {
        const result = await getPool().query(
            `SELECT id, title, description, icon, position, cta_text, cta_link, is_active, start_date, end_date, display_rules, created_at, updated_at
             FROM toque.popups WHERE id = $1`,
            [id]
        );
        return toCamelCase(result.rows[0] || null);
    }

    async findActivePopups(): Promise<Popup[]> {
        const result = await getPool().query(
            `SELECT id, title, description, icon, position, cta_text, cta_link, is_active, start_date, end_date, display_rules, created_at, updated_at
             FROM toque.popups
             WHERE is_active = true
               AND (start_date IS NULL OR start_date <= CURRENT_TIMESTAMP)
               AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
             ORDER BY created_at DESC`
        );
        return toCamelCase(result.rows);
    }

    async create(dto: CreatePopupDTO): Promise<Popup> {
        const result = await getPool().query(
            `INSERT INTO toque.popups 
             (title, description, icon, position, cta_text, cta_link, is_active, start_date, end_date, display_rules)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                dto.title,
                dto.description ?? null,
                dto.icon,
                dto.position,
                dto.ctaText ?? null,
                dto.ctaLink ?? null,
                dto.isActive ?? false,
                dto.startDate ?? null,
                dto.endDate ?? null,
                dto.displayRules ? JSON.stringify(dto.displayRules) : '{}',
            ]
        );
        return toCamelCase(result.rows[0]);
    }

    async update(id: string, dto: UpdatePopupDTO): Promise<Popup | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let index = 1;

        if (dto.title !== undefined) { fields.push(`title = $${index++}`); values.push(dto.title); }
        if (dto.description !== undefined) { fields.push(`description = $${index++}`); values.push(dto.description); }
        if (dto.icon !== undefined) { fields.push(`icon = $${index++}`); values.push(dto.icon); }
        if (dto.position !== undefined) { fields.push(`position = $${index++}`); values.push(dto.position); }
        if (dto.ctaText !== undefined) { fields.push(`cta_text = $${index++}`); values.push(dto.ctaText); }
        if (dto.ctaLink !== undefined) { fields.push(`cta_link = $${index++}`); values.push(dto.ctaLink); }
        if (dto.isActive !== undefined) { fields.push(`is_active = $${index++}`); values.push(dto.isActive); }
        if (dto.startDate !== undefined) { fields.push(`start_date = $${index++}`); values.push(dto.startDate); }
        if (dto.endDate !== undefined) { fields.push(`end_date = $${index++}`); values.push(dto.endDate); }
        if (dto.displayRules !== undefined) { fields.push(`display_rules = $${index++}`); values.push(dto.displayRules ? JSON.stringify(dto.displayRules) : null); }

        if (fields.length === 0) return this.findById(id);

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE toque.popups
            SET ${fields.join(', ')}
            WHERE id = $${index}
            RETURNING *`;

        const result = await getPool().query(query, values);
        return toCamelCase(result.rows[0] || null);
    }

    async delete(id: string): Promise<boolean> {
        const result = await getPool().query(
            'DELETE FROM toque.popups WHERE id = $1 RETURNING id',
            [id]
        );
        return (result.rowCount || 0) > 0;
    }
}
