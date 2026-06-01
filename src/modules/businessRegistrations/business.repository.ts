import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { BusinessRegistration, ImportRow } from "./business.model.js";

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

    async findPending(): Promise<BusinessRegistration[]> {
        const result = await getPool().query(
            `SELECT * FROM toque.business_registrations 
         WHERE status = 'submitted' 
         ORDER BY created_at DESC`
        );
        return toCamelCase(result.rows);
    }

    async create(business: BusinessRegistration): Promise<BusinessRegistration> {
        const result = await getPool().query(
            `
            INSERT INTO toque.business_registrations (
                legal_name, trade_name, ruc, category_id,
                departament_id, province_id, district_id,
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
                business.departamentId, business.provinceId, business.districtId,
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
                departament_id = $5,
                province_id = $6,
                district_id = $7,
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
                business.departamentId, business.provinceId, business.districtId,
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

    async previewImport(rows: ImportRow[]): Promise<{ total: number; matched: number; samples: any[] }> {
        if (rows.length === 0) return { total: 0, matched: 0, samples: [] };

        const counts = await getPool().query(
            `
        SELECT
            count(*)::int AS total,
            count(*) FILTER (
                WHERE cat.id IS NOT NULL AND dep.id IS NOT NULL
                  AND prov.id IS NOT NULL AND dist.id IS NOT NULL
            )::int AS matched
        FROM jsonb_to_recordset($1::jsonb) AS x(
            legal_name text, ruc text, category text,
            departament text, province text, district text,
            contact_name text, phone text, email text
        )
        LEFT JOIN maestro.business_categories cat
            ON upper(trim(cat.business_category)) = upper(trim(x.category))
        LEFT JOIN maestro.departament dep
            ON upper(trim(dep.departament)) = upper(trim(x.departament))
        LEFT JOIN maestro.province prov
            ON upper(trim(prov.province)) = upper(trim(x.province))
           AND prov.ccdd::text = dep.id::text
        LEFT JOIN maestro.district dist
            ON upper(trim(dist.district)) = upper(trim(x.district))
           AND dist.ccpp::text = prov.id::text
        `,
            [JSON.stringify(rows)]
        );

        // muestra de las que NO hicieron match, para depurar
        const samples = await getPool().query(
            `
        SELECT x.category, x.departament, x.province, x.district,
               (cat.id IS NULL)  AS rubro_falta,
               (dep.id IS NULL)  AS depto_falta,
               (prov.id IS NULL) AS prov_falta,
               (dist.id IS NULL) AS dist_falta
        FROM jsonb_to_recordset($1::jsonb) AS x(
            legal_name text, ruc text, category text,
            departament text, province text, district text,
            contact_name text, phone text, email text
        )
        LEFT JOIN maestro.business_categories cat
            ON upper(trim(cat.business_category)) = upper(trim(x.category))
        LEFT JOIN maestro.departament dep
            ON upper(trim(dep.departament)) = upper(trim(x.departament))
        LEFT JOIN maestro.province prov
            ON upper(trim(prov.province)) = upper(trim(x.province))
           AND prov.ccdd::text = dep.id::text
        LEFT JOIN maestro.district dist
            ON upper(trim(dist.district)) = upper(trim(x.district))
           AND dist.ccpp::text = prov.id::text
        WHERE cat.id IS NULL OR dep.id IS NULL OR prov.id IS NULL OR dist.id IS NULL
        LIMIT 20
        `,
            [JSON.stringify(rows)]
        );

        return {
            total: counts.rows[0].total,
            matched: counts.rows[0].matched,
            samples: samples.rows,
        };
    }

    async bulkInsert(rows: ImportRow[]): Promise<number> {
        if (rows.length === 0) return 0;

        const result = await getPool().query(
            `
        WITH resolved AS (
            SELECT
                x.legal_name, x.ruc, x.contact_name, x.phone, x.email,
                cat.id  AS category_id,
                dep.id  AS departament_id,
                prov.id AS province_id,
                dist.id AS district_id
            FROM jsonb_to_recordset($1::jsonb) AS x(
                legal_name text, ruc text, category text,
                departament text, province text, district text,
                contact_name text, phone text, email text
            )
            LEFT JOIN maestro.business_categories cat
                ON upper(trim(cat.business_category)) = upper(trim(x.category))
            LEFT JOIN maestro.departament dep
                ON upper(trim(dep.departament)) = upper(trim(x.departament))
            LEFT JOIN maestro.province prov
                ON upper(trim(prov.province)) = upper(trim(x.province))
               AND prov.ccdd::text = dep.id::text
            LEFT JOIN maestro.district dist
                ON upper(trim(dist.district)) = upper(trim(x.district))
               AND dist.ccpp::text = prov.id::text
        )
        INSERT INTO toque.business_registrations (
            legal_name, trade_name, ruc, category_id,
            departament_id, province_id, district_id,
            contact_name, contact_position, phone, email,
            benefit_percentage_discounts, benefit_2x1_promotions,
            benefit_free_products, benefit_loyalty_points,
            benefit_exclusive_offers, additional_comments,
            terms_accepted, status
        )
        SELECT
            legal_name, legal_name, ruc, category_id,
            departament_id, province_id, district_id,
            contact_name, 'otro', phone, email,
            false, false, false, false, false, null,
            true, 'submitted'
        FROM resolved
        WHERE category_id IS NOT NULL
          AND departament_id IS NOT NULL
          AND province_id IS NOT NULL
          AND district_id IS NOT NULL
        `,
            [JSON.stringify(rows)]
        );

        return result.rowCount ?? 0;
    }
}