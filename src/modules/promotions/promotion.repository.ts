import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { Promotion, PromoTypes, PurchaseTypes } from "./promotion.model.js";

export class PromotionRepository {

    async findAll(): Promise<Promotion[]> {
        const result = await getPool().query("SELECT * FROM toque.promotions ORDER BY id");
        return toCamelCase(result.rows);
    }

    async findById(id: string): Promise<Promotion | null> {
        const result = await getPool().query(
            "SELECT * FROM toque.promotions WHERE id=$1",
            [id]
        );

        return toCamelCase(result.rows[0] || null);
    }

    async create(promotion: Promotion): Promise<Promotion> {
        const result = await getPool().query(
            `
            INSERT INTO toque.promotions 
            (business_name_id, city_id, title, description, promo_price, original_price,
            promo_type_id, purchase_type_id, expiration_date, image_url, campaign_id, product_category_id) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            RETURNING *
            `,
            [promotion.businessNameId, promotion.cityId, promotion.title, promotion.description,
            promotion.promoPrice, promotion.originalPrice, promotion.promoTypeId, promotion.purchaseTypeId,
            promotion.expirationDate, promotion.imageUrl, promotion.campaignId || null, promotion.productCategoryId || null]
        );

        return toCamelCase(result.rows[0]);
    }

    async update(id: string, promotion: Promotion): Promise<Promotion | null> {
        const result = await getPool().query(
            `
            UPDATE toque.promotions
            SET 
                business_name_id=$1,
                city_id=$2,
                title=$3,
                description=$4,
                promo_price=$5,
                original_price=$6,
                promo_type_id=$7,
                purchase_type_id=$8,
                expiration_date=$9,
                image_url=$10,
                campaign_id=$11,
                product_category_id=$12,
                updated_at = CURRENT_TIMESTAMP
            WHERE id=$13
            RETURNING *
            `,
            [promotion.businessNameId, promotion.cityId, promotion.title, promotion.description,
            promotion.promoPrice, promotion.originalPrice, promotion.promoTypeId, promotion.purchaseTypeId,
            promotion.expirationDate, promotion.imageUrl, promotion.campaignId || null, promotion.productCategoryId || null, id]
        );

        return toCamelCase(result.rows[0] || null);
    }

    async incrementViews(id: string): Promise<void> {
        await getPool().query(
            "UPDATE toque.promotions SET views = views + 1 WHERE id=$1",
            [id]
        );
    }

    async delete(id: string): Promise<void> {
        await getPool().query("DELETE FROM toque.promotions WHERE id=$1", [id]);
    }

    async findPromoTypes(): Promise<PromoTypes[]> {
        const result = await getPool().query(
            "SELECT id, promo FROM maestro.promo_type ORDER BY promo");
        return result.rows;
    }

    async findPurchaseTypes(): Promise<PurchaseTypes[]> {
        const result = await getPool().query(
            "SELECT id, purchase FROM maestro.purchase_type ORDER BY purchase");
        return result.rows;
    }

    async findAllWithNames(): Promise<any[]> {
        const result = await getPool().query(`
            SELECT p.*, b.business_name, d.departament as city_name,
                   c.name as campaign_name, pc.product_category as category_name,
                   pt.promo as promo_type_name, put.purchase as purchase_type_name
            FROM toque.promotions p
            LEFT JOIN toque.businesses b ON b.id = p.business_name_id
            LEFT JOIN maestro.departament d ON d.id = p.city_id
            LEFT JOIN toque.campaigns c ON c.id = p.campaign_id
            LEFT JOIN maestro.product_categories pc ON pc.id = p.product_category_id
            LEFT JOIN maestro.promo_type pt ON pt.id = p.promo_type_id
            LEFT JOIN maestro.purchase_type put ON put.id = p.purchase_type_id
            ORDER BY p.id
        `);
        return toCamelCase(result.rows);
    }

    async findBusinessByName(name: string): Promise<string | null> {
        const result = await getPool().query(
            "SELECT id FROM toque.businesses WHERE business_name ILIKE $1 LIMIT 1",
            [name.trim()]
        );
        return result.rows.length ? result.rows[0].id : null;
    }

    async findCityByName(name: string): Promise<string | null> {
        const result = await getPool().query(
            "SELECT id FROM maestro.departament WHERE departament ILIKE $1 LIMIT 1",
            [name.trim()]
        );
        return result.rows.length ? result.rows[0].id : null;
    }

    async findCampaignByName(name: string): Promise<string | null> {
        const result = await getPool().query(
            "SELECT id FROM toque.campaigns WHERE name ILIKE $1 LIMIT 1",
            [name.trim()]
        );
        return result.rows.length ? result.rows[0].id : null;
    }

    async findProductCategoryByName(name: string): Promise<string | null> {
        const result = await getPool().query(
            "SELECT id FROM maestro.product_categories WHERE product_category ILIKE $1 LIMIT 1",
            [name.trim()]
        );
        return result.rows.length ? result.rows[0].id : null;
    }

    async findPromoTypeByName(name: string): Promise<string | null> {
        const result = await getPool().query(
            "SELECT id FROM maestro.promo_type WHERE promo ILIKE $1 LIMIT 1",
            [name.trim()]
        );
        return result.rows.length ? result.rows[0].id : null;
    }

    async findPurchaseTypeByName(name: string): Promise<string | null> {
        const result = await getPool().query(
            "SELECT id FROM maestro.purchase_type WHERE purchase ILIKE $1 LIMIT 1",
            [name.trim()]
        );
        return result.rows.length ? result.rows[0].id : null;
    }

}