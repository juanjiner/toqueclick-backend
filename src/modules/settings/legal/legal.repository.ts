import { getPool } from "../../../config/database.js";
import { toCamelCase } from "../../../utils/camelCase.js";
import { Legal } from "./legal.model.js";

const pool = getPool();

export class LegalRepository {

    async findLegal(): Promise<Legal> {

        const result = await pool.query(
            "SELECT * FROM toque.legal_information"
        );

        return toCamelCase(result.rows[0]);
    }

    async create(legal: Legal): Promise<Legal> {
        const result = await pool.query(
            `
        INSERT INTO toque.legal_information 
        (company_name, ruc, legal_address) 
        VALUES ($1,$2,$3)
        RETURNING *
        `,
            [legal.companyName, legal.ruc, legal.legalAddress]
        );

        return toCamelCase(result.rows[0]);
    }

    async update(id: string, legal: Legal): Promise<Legal | null> {
        const result = await pool.query(
            `
        UPDATE toque.legal_information
        SET 
            company_name=$1,
            ruc=$2,
            legal_address=$3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id=$4
        RETURNING *
        `,
            [legal.companyName, legal.ruc, legal.legalAddress, id]
        );

        return toCamelCase(result.rows[0] || null);
    }
}