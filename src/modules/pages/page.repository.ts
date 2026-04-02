import { getPool } from '../../config/database.js';
import { toCamelCase } from '../../utils/camelCase.js';
import {
    Page, PageSection, PageItem,
    UpdatePageDTO, UpsertSectionDTO,
    CreateItemDTO, UpdateItemDTO, ReorderItemsDTO,
    CreateFeatureDTO,
    PageItemFeature,
} from './page.model.js';

export class PageRepository {

    async findAll(): Promise<Page[]> {
        const result = await getPool().query(
            `SELECT id, slug, name, description, published, updated_at, sort_order
             FROM toque.pages ORDER BY sort_order`
        );
        return toCamelCase(result.rows);
    }

    async findBySlug(slug: string): Promise<Page | null> {
        const result = await getPool().query(
            `SELECT id, slug, name, description, published, updated_at
             FROM toque.pages WHERE slug = $1`,
            [slug]
        );
        return toCamelCase(result.rows[0] || null);
    }

    async findBySlugWithSections(slug: string): Promise<Page | null> {
        const pageResult = await getPool().query(
            `SELECT id, slug, name, description, published, updated_at
             FROM toque.pages WHERE slug = $1`,
            [slug]
        );
        if (!pageResult.rows[0]) return null;

        const page: Page = toCamelCase(pageResult.rows[0]);

        const sectionsResult = await getPool().query(
            `SELECT * FROM toque.page_sections
             WHERE page_id = $1 ORDER BY sort_order ASC`,
            [page.id]
        );
        const sections: PageSection[] = toCamelCase(sectionsResult.rows);

        for (const section of sections) {
            const itemsResult = await getPool().query(
                `SELECT * FROM toque.page_items
                 WHERE section_id = $1 ORDER BY sort_order ASC`,
                [section.id]
            );
            section.items = toCamelCase(itemsResult.rows);
            for (const item of section.items ?? []) {
                const featuresResult = await getPool().query(
                    `SELECT * FROM toque.page_item_features
             WHERE item_id = $1 ORDER BY sort_order ASC`,
                    [item.id]
                );
                item.features = toCamelCase(featuresResult.rows);
            }
        }

        page.sections = sections;
        return page;
    }

    async updatePage(slug: string, dto: UpdatePageDTO): Promise<Page | null> {
        const result = await getPool().query(
            `UPDATE toque.pages
             SET published  = COALESCE($1, published),
                 updated_at = CURRENT_TIMESTAMP
             WHERE slug = $2
             RETURNING *`,
            [dto.published ?? null, slug]
        );
        return toCamelCase(result.rows[0] || null);
    }

    async upsertSection(pageId: string, dto: UpsertSectionDTO): Promise<PageSection> {
        const result = await getPool().query(
            `INSERT INTO toque.page_sections
      (page_id, section_key, title, subtitle, description,
       cta_text, cta_link, cta_text2, cta_link2, image_url,
       carousel_enabled, regulatory_text, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT (page_id, section_key) DO UPDATE SET
        title            = EXCLUDED.title,
        subtitle         = EXCLUDED.subtitle,
        description      = EXCLUDED.description,
        cta_text         = EXCLUDED.cta_text,
        cta_link         = EXCLUDED.cta_link,
        cta_text2        = EXCLUDED.cta_text2,
        cta_link2        = EXCLUDED.cta_link2,
        image_url        = EXCLUDED.image_url,
        carousel_enabled = EXCLUDED.carousel_enabled,
        regulatory_text  = EXCLUDED.regulatory_text,
        sort_order       = EXCLUDED.sort_order,
        updated_at       = CURRENT_TIMESTAMP
     RETURNING *`,
            [
                pageId,
                dto.sectionKey,
                dto.title ?? null,
                dto.subtitle ?? null,
                dto.description ?? null,
                dto.ctaText ?? null,
                dto.ctaLink ?? null,
                dto.ctaText2 ?? null,
                dto.ctaLink2 ?? null,
                dto.imageUrl ?? null,
                dto.carouselEnabled ?? false,
                dto.regulatoryText ?? null,
                dto.sortOrder ?? 0,
            ]
        );
        return toCamelCase(result.rows[0]);
    }

    async findItemById(id: string): Promise<PageItem | null> {
        const result = await getPool().query(
            'SELECT * FROM toque.page_items WHERE id = $1', [id]
        );
        return toCamelCase(result.rows[0] || null);
    }

    async createItem(sectionId: string, dto: CreateItemDTO): Promise<PageItem> {
        const result = await getPool().query(
            `INSERT INTO toque.page_items
                (section_id, icon, title, description, image_url, cta_text, cta_link, cta_text2,cta_link2, sort_order)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             RETURNING *`,
            [
                sectionId,
                dto.icon ?? null,
                dto.title ?? null,
                dto.description ?? null,
                dto.imageUrl ?? null,
                dto.ctaText ?? null,
                dto.ctaLink ?? null,
                dto.ctaText2 ?? null,
                dto.ctaLink2 ?? null,
                dto.sortOrder ?? 0,
            ]
        );
        return toCamelCase(result.rows[0]);
    }

    async updateItem(id: string, dto: UpdateItemDTO): Promise<PageItem | null> {
        const result = await getPool().query(
            `UPDATE toque.page_items SET
                icon        = COALESCE($1, icon),
                title       = COALESCE($2, title),
                description = COALESCE($3, description),
                image_url   = COALESCE($4, image_url),
                cta_text    = COALESCE($5, cta_text),
                cta_link    = COALESCE($6, cta_link),
                cta_text2   = COALESCE($7, cta_text2),
                cta_link2   = COALESCE($8, cta_link2),
                sort_order  = COALESCE($9, sort_order)
             WHERE id = $10 RETURNING *`,
            [
                dto.icon ?? null,
                dto.title ?? null,
                dto.description ?? null,
                dto.imageUrl ?? null,
                dto.ctaText ?? null,
                dto.ctaLink ?? null,
                dto.ctaText2 ?? null,
                dto.ctaLink2 ?? null,
                dto.sortOrder ?? null,
                id,
            ]
        );
        return toCamelCase(result.rows[0] || null);
    }

    async deleteItem(id: string): Promise<void> {
        await getPool().query(
            'DELETE FROM toque.page_items WHERE id = $1', [id]
        );
    }

    async reorderItems(dto: ReorderItemsDTO): Promise<void> {
        const client = await getPool().connect();
        try {
            await client.query('BEGIN');
            for (const item of dto.items) {
                await client.query(
                    'UPDATE toque.page_items SET sort_order = $1 WHERE id = $2',
                    [item.sortOrder, item.id]
                );
            }
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async createFeature(itemId: string, dto: CreateFeatureDTO): Promise<PageItemFeature> {
        const result = await getPool().query(
            `INSERT INTO toque.page_item_features (item_id, text, sort_order)
     VALUES ($1, $2, $3) RETURNING *`,
            [itemId, dto.text, dto.sortOrder ?? 0]
        );
        return toCamelCase(result.rows[0]);
    }

    async deleteFeature(id: string): Promise<void> {
        await getPool().query(
            'DELETE FROM toque.page_item_features WHERE id = $1', [id]
        );
    }

    async reorderFeatures(items: { id: string; sortOrder: number }[]): Promise<void> {
        const client = await getPool().connect();
        try {
            await client.query('BEGIN');
            for (const item of items) {
                await client.query(
                    'UPDATE toque.page_item_features SET sort_order = $1 WHERE id = $2',
                    [item.sortOrder, item.id]
                );
            }
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}