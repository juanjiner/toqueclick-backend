import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { BusinessRegistration } from "./business.model.js";

export class BusinessRepository {

    async findAll(): Promise<BusinessRegistration[]> {
        const result = await getPool().query(
            "SELECT * FROM toque.business_registrations ORDER BY created_at DESC"
        );
        return toCamelCase(result.rows);
    }

    async findById(id: string): Promise<BusinessRegistration | null> {
        const result = await getPool().query(
            "SELECT * FROM toque.business_registrations WHERE id = $1",
            [id]
        );
        return toCamelCase(result.rows[0] || null);
    }

    async create(business: BusinessRegistration): Promise<BusinessRegistration> {
        const result = await getPool().query(
            `
            INSERT INTO toque.business_registrations (
                legal_name, trade_name, ruc, category_id,
                department, province, district,
                contact_name, contact_position, phone, email,
                benefit_percentage_discounts, benefit_2x1_promotions,
                benefit_free_products, benefit_loyalty_points,
                benefit_exclusive_offers, additional_comments,
                terms_accepted, status
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
                $12,$13,$14,$15,$16,$17,$18,$19
            )
            RETURNING *
            `,
            [
                business.legalName, business.tradeName, business.ruc, business.categoryId,
                business.departmentId, business.provinceId, business.districtId,
                business.contactName, business.contactPosition, business.phone, business.email,
                business.benefitPercentageDiscounts, business.benefit2x1Promotions,
                business.benefitFreeProducts, business.benefitLoyaltyPoints,
                business.benefitExclusiveOffers, business.additionalComments ?? null,
                business.termsAccepted, business.status ?? "submitted"
            ]
        );
        return toCamelCase(result.rows[0]);
    }

    async update(id: string, business: BusinessRegistration): Promise<BusinessRegistration | null> {
        const result = await getPool().query(
            `
            UPDATE toque.business_registrations
            SET
                legal_name = $1,
                trade_name = $2,
                ruc = $3,
                category_id = $4,
                department = $5,
                province = $6,
                district = $7,
                contact_name = $8,
                contact_position = $9,
                phone = $10,
                email = $11,
                benefit_percentage_discounts = $12,
                benefit_2x1_promotions = $13,
                benefit_free_products = $14,
                benefit_loyalty_points = $15,
                benefit_exclusive_offers = $16,
                additional_comments = $17,
                terms_accepted = $18,
                status = $19,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $20
            RETURNING *
            `,
            [
                business.legalName, business.tradeName, business.ruc, business.categoryId,
                business.departmentId, business.provinceId, business.districtId,
                business.contactName, business.contactPosition, business.phone, business.email,
                business.benefitPercentageDiscounts, business.benefit2x1Promotions,
                business.benefitFreeProducts, business.benefitLoyaltyPoints,
                business.benefitExclusiveOffers, business.additionalComments ?? null,
                business.termsAccepted, business.status ?? "submitted",
                id
            ]
        );
        return toCamelCase(result.rows[0] || null);
    }

    async updateStatus(id: string, status: string): Promise<BusinessRegistration | null> {
        const result = await getPool().query(
            `
            UPDATE toque.business_registrations
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
            `,
            [status, id]
        );
        return toCamelCase(result.rows[0] || null);
    }

    async delete(id: string): Promise<void> {
        await getPool().query(
            "DELETE FROM toque.business_registrations WHERE id = $1",
            [id]
        );
    }
}