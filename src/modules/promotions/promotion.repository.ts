import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { Promotion, PromoTypes, PurchaseTypes } from "./promotion.model.js";

const pool = getPool();

export class PromotionRepository {

    async findAll(): Promise<Promotion[]> {
        const result = await pool.query("SELECT * FROM toque.promotions ORDER BY id");
        return result.rows;
    }

    async create(promotion: Promotion): Promise<Promotion> {
        const result = await pool.query(
            `
            INSERT INTO toque.promotions 
            (business_name_id, city_id, title, description, promo_price, original_price,
            promo_type_id, purchase_type_id, expiration_date, image_url) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *
            `,
            [promotion.businessNameId, promotion.cityId, promotion.title, promotion.description,
            promotion.promoPrice, promotion.originalPrice, promotion.promoTypeId, promotion.purchaseTypeId,
            promotion.expirationDate, promotion.imageUrl]
        );

        return toCamelCase(result.rows[0]);
    }

    async update(id: string, promotion: Promotion): Promise<Promotion | null> {
        const result = await pool.query(
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
                updated_at = CURRENT_TIMESTAMP
            WHERE id=$11
            RETURNING *
            `,
            [promotion.businessNameId, promotion.cityId, promotion.title, promotion.description,
            promotion.promoPrice, promotion.originalPrice, promotion.promoTypeId, promotion.purchaseTypeId,
            promotion.expirationDate, promotion.imageUrl, id]
        );

        return toCamelCase(result.rows[0] || null);
    }

    async delete(id: string): Promise<void> {
        await pool.query("DELETE FROM toque.promotions WHERE id=$1", [id]);
    }

    async findPromoTypes(): Promise<PromoTypes[]> {
        const result = await pool.query(
            "SELECT id, promo FROM maestro.promo_type ORDER BY promo");
        return result.rows;
    }

    async findPurchaseTypes(): Promise<PurchaseTypes[]> {
        const result = await pool.query(
            "SELECT id, purchase FROM maestro.purchase_type ORDER BY purchase");
        return result.rows;
    }

}