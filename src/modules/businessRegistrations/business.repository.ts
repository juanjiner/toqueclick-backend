import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { BusinessRegistration } from "./business.model.js";

export class BusinessRepository {

    async findAll(limit: number, offset: number, search?: string): Promise<{ data: BusinessRegistration[]; total: number }> {
        const where = search
            ? `WHERE legal_name ILIKE $3 OR trade_name ILIKE $3 OR ruc ILIKE $3
              OR contact_name ILIKE $3 OR email ILIKE $3`
            : "";

        const params: any[] = [limit, offset];
        if (search) params.push(`%${search}%`);

        const dataResult = await getPool().query(
            `SELECT * FROM toque.business_registrations
         ${where}
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
            params
        );

        const countParams: any[] = [];
        if (search) countParams.push(`%${search}%`);
        const countWhere = search
            ? `WHERE legal_name ILIKE $1 OR trade_name ILIKE $1 OR ruc ILIKE $1
              OR contact_name ILIKE $1 OR email ILIKE $1`
            : "";

        const countResult = await getPool().query(
            `SELECT count(*)::int AS total FROM toque.business_registrations ${countWhere}`,
            countParams
        );

        return {
            data: toCamelCase(dataResult.rows),
            total: countResult.rows[0].total,
        };
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
         ORDER BY created_at DESC limit 10`
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
        const pool = getPool();
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // 1. Obtener la solicitud actual
            const regResult = await client.query(
                "SELECT * FROM toque.business_registrations WHERE id = $1",
                [id]
            );
            const registration = regResult.rows[0];
            if (!registration) {
                await client.query("ROLLBACK");
                return null;
            }

            // 2. Si el nuevo estado es 'approved' o 'approved' (en inglés/español) y no se ha creado el comercio aún
            let businessId = registration.business_id;
            const targetStatus = status.toLowerCase();

            if ((targetStatus === "approved" || targetStatus === "aprobado") && !businessId) {
                // Generar descripción por defecto
                const desc = registration.additional_comments || "Comercio afiliado desde el formulario de registro.";
                
                // Obtener el nombre del departamento para la dirección
                const deptResult = await client.query(
                    "SELECT departament FROM maestro.departament WHERE id = $1",
                    [registration.departament_id]
                );
                const deptName = deptResult.rows[0]?.departament || "";
                const address = `Dirección pendiente, ${deptName}`;

                // Insertar el comercio en toque.businesses
                const busResult = await client.query(
                    `
                    INSERT INTO toque.businesses 
                    (business_name, city_id, category_id, description, address, phone, logo_url, status) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING id
                    `,
                    [
                        registration.trade_name,
                        registration.departament_id,
                        registration.category_id,
                        desc,
                        address,
                        registration.phone,
                        "static/business/local-fake-image-default.png",
                        "APROBADO"
                    ]
                );
                businessId = busResult.rows[0].id;

                // Crear promociones por defecto de acuerdo a los beneficios elegidos
                const promoTypesResult = await client.query("SELECT id, promo FROM maestro.promo_type");
                const promoTypes = promoTypesResult.rows;

                const getPromoTypeId = (name: string): string => {
                    const match = promoTypes.find((t: any) => t.promo.toLowerCase().includes(name.toLowerCase()));
                    return match ? match.id : (promoTypes[0]?.id || "");
                };

                // Obtener ID de tipo de compra Local
                const purchaseTypeResult = await client.query("SELECT id FROM maestro.purchase_type WHERE purchase ILIKE 'Local' LIMIT 1");
                const purchaseTypeId = purchaseTypeResult.rows[0]?.id || null;

                // Obtener ID de una categoría de producto por defecto
                const prodCatResult = await client.query("SELECT id FROM maestro.product_categories LIMIT 1");
                const productCategoryId = prodCatResult.rows[0]?.id || null;

                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 30); // 30 días de vigencia

                // Insertar promociones según los beneficios seleccionados
                if (registration.benefit_percentage_discounts) {
                    await client.query(
                        `
                        INSERT INTO toque.promotions 
                        (business_name_id, city_id, product_category_id, title, description, promo_price, original_price, promo_type_id, purchase_type_id, expiration_date, image_url)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        `,
                        [
                            businessId,
                            registration.departament_id,
                            productCategoryId,
                            "Descuento Exclusivo",
                            `Aprovecha un gran descuento en ${registration.trade_name} pagando con tu billetera TOQUE.`,
                            0.00,
                            0.00,
                            getPromoTypeId("Descuento"),
                            purchaseTypeId,
                            expirationDate,
                            "static/promotion/local-fake-image-default.png"
                        ]
                    );
                }

                if (registration.benefit_2x1_promotions) {
                    await client.query(
                        `
                        INSERT INTO toque.promotions 
                        (business_name_id, city_id, product_category_id, title, description, promo_price, original_price, promo_type_id, purchase_type_id, expiration_date, image_url)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        `,
                        [
                            businessId,
                            registration.departament_id,
                            productCategoryId,
                            "Promoción 2x1",
                            `Disfruta de la promoción 2x1 en productos seleccionados de ${registration.trade_name}.`,
                            0.00,
                            0.00,
                            getPromoTypeId("2x1"),
                            purchaseTypeId,
                            expirationDate,
                            "static/promotion/local-fake-image-default.png"
                        ]
                    );
                }

                if (registration.benefit_free_products) {
                    await client.query(
                        `
                        INSERT INTO toque.promotions 
                        (business_name_id, city_id, product_category_id, title, description, promo_price, original_price, promo_type_id, purchase_type_id, expiration_date, image_url)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        `,
                        [
                            businessId,
                            registration.departament_id,
                            productCategoryId,
                            "Producto de Regalo",
                            `Obtén un producto de regalo por consumos mínimos en ${registration.trade_name} usando TOQUE.`,
                            0.00,
                            0.00,
                            getPromoTypeId("Descuento"),
                            purchaseTypeId,
                            expirationDate,
                            "static/promotion/local-fake-image-default.png"
                        ]
                    );
                }

                if (registration.benefit_exclusive_offers) {
                    await client.query(
                        `
                        INSERT INTO toque.promotions 
                        (business_name_id, city_id, product_category_id, title, description, promo_price, original_price, promo_type_id, purchase_type_id, expiration_date, image_url)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        `,
                        [
                            businessId,
                            registration.departament_id,
                            productCategoryId,
                            "Oferta Especial",
                            `Accede a una oferta exclusiva en ${registration.trade_name} pagando con tu billetera digital.`,
                            0.00,
                            0.00,
                            getPromoTypeId("Descuento"),
                            purchaseTypeId,
                            expirationDate,
                            "static/promotion/local-fake-image-default.png"
                        ]
                    );
                }
            }

            // 3. Actualizar el estado de la solicitud y asociar el business_id
            const updateResult = await client.query(
                `
                UPDATE toque.business_registrations
                SET status = $1, business_id = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
                RETURNING *
                `,
                [status, businessId, id]
            );

            await client.query("COMMIT");
            return toCamelCase(updateResult.rows[0] || null);

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async delete(id: string): Promise<void> {
        await getPool().query(
            "DELETE FROM toque.business_registrations WHERE id = $1",
            [id]
        );
    }

    async findAllWithNames(): Promise<any[]> {
        const result = await getPool().query(`
            SELECT r.*, c.business_category as category_name,
                   d.departament as departament_name,
                   p.province as province_name,
                   dist.district as district_name
            FROM toque.business_registrations r
            LEFT JOIN maestro.business_categories c ON c.id = r.category_id
            LEFT JOIN maestro.departament d ON d.id = r.departament_id
            LEFT JOIN maestro.province p ON p.id = r.province_id
            LEFT JOIN maestro.district dist ON dist.id = r.district_id
            ORDER BY r.created_at DESC
        `);
        return toCamelCase(result.rows);
    }

}