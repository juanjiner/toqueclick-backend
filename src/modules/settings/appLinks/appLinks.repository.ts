import { getPool } from "../../../config/database.js";
import { toCamelCase } from "../../../utils/camelCase.js";
import { AppLinks } from "./appLinks.model.js";

const pool = getPool();

export class AppLinksRepository {

    async getAppLinks(): Promise<AppLinks> {

        const result = await pool.query(
            "SELECT * FROM toque.app_download_links"
        );

        return toCamelCase(result.rows[0]);
    }

    async create(appLinks: AppLinks): Promise<AppLinks> {
        const result = await pool.query(
            `
        INSERT INTO toque.app_download_links 
        (app_store_url, google_play_url) 
        VALUES ($1,$2)
        RETURNING *
        `,
            [appLinks.appStoreUrl, appLinks.googlePlayUrl]
        );

        return toCamelCase(result.rows[0]);
    }

    async update(id: string, appLinks: AppLinks): Promise<AppLinks | null> {
        const result = await pool.query(
            `
        UPDATE toque.app_download_links
        SET 
            app_store_url=$1,
            google_play_url=$2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id=$3
        RETURNING *
        `,
            [appLinks.appStoreUrl, appLinks.googlePlayUrl, id]
        );

        return toCamelCase(result.rows[0] || null);
    }
}