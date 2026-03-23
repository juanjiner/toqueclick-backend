import { getPool } from "../../../config/database.js";
import { toCamelCase } from "../../../utils/camelCase.js";
import { Maintenance } from "./maintenance.model.js";

const pool = getPool();

export class MaintenanceRepository {

    async findMaintenance(): Promise<Maintenance> {

        const result = await pool.query(
            "SELECT * FROM toque.site_maintenance"
        );

        return toCamelCase(result.rows[0] || null);
    }

    async create(maintenance: Maintenance): Promise<Maintenance> {
        const result = await pool.query(
            `
        INSERT INTO toque.site_maintenance 
        (maintenance_mode, maintenance_message) 
        VALUES ($1,$2)
        RETURNING *
        `,
            [maintenance.maintenanceMode, maintenance.maintenanceMessage]
        );

        return toCamelCase(result.rows[0]);
    }

    async update(id: string, maintenance: Maintenance): Promise<Maintenance | null> {
        const result = await pool.query(
            `
        UPDATE toque.site_maintenance
        SET 
            maintenance_mode=$1,
            maintenance_message=$2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id=$3
        RETURNING *
        `,
            [maintenance.maintenanceMode, maintenance.maintenanceMessage, id]
        );

        return toCamelCase(result.rows[0] || null);
    }
}