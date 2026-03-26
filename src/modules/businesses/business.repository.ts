import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { Business } from "./business.model.js";

export class BusinessRepository {

    async findAll(): Promise<Business[]> {
        const result = await getPool().query("SELECT * FROM toque.businesses ORDER BY id");
        return toCamelCase(result.rows);
    }

    async findById(id: string): Promise<Business | null> {
        const result = await getPool().query(
            "SELECT * FROM toque.businesses WHERE id=$1",
            [id]
        );
        return toCamelCase(result.rows[0] || null);
    }

    async create(business: Business): Promise<Business> {
        const result = await getPool().query(
            `
            INSERT INTO toque.businesses 
            (business_name, city_id, category_id, description, address, phone, logo_url) 
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *
            `,
            [business.businessName, business.cityId, business.categoryId, business.description,
            business.address, business.phone, business.logoUrl]
        );

        return toCamelCase(result.rows[0]);
    }

    async update(id: string, business: Business): Promise<Business | null> {
        const result = await getPool().query(
            `
            UPDATE toque.businesses
            SET 
                business_name=$1,
                city_id=$2,
                category_id=$3,
                description=$4,
                address=$5,
                phone=$6,
                logo_url=$7,
                updated_at = CURRENT_TIMESTAMP
            WHERE id=$8
            RETURNING *
            `,
            [business.businessName, business.cityId, business.categoryId, business.description,
            business.address, business.phone, business.logoUrl, id]
        );

        return toCamelCase(result.rows[0] || null);
    }

    async delete(id: string): Promise<void> {
        await getPool().query("DELETE FROM toque.businesses WHERE id=$1", [id]);
    }
}