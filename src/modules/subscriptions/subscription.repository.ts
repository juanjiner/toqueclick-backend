import { getPool } from "../../config/database.js";
import { toCamelCase } from "../../utils/camelCase.js";
import { Subscription } from "./subscription.model.js";

export class SubscriptionRepository {

    async findByEmail(email: string): Promise<Subscription | null> {
        const result = await getPool().query(
            "SELECT * FROM toque.subscriptions WHERE email = $1",
            [email]
        );
        return result.rows[0] ? toCamelCase(result.rows[0]) : null;
    }

    async create(email: string): Promise<Subscription> {
        const result = await getPool().query(
            `INSERT INTO toque.subscriptions (email)
             VALUES ($1)
             RETURNING *`,
            [email]
        );
        return toCamelCase(result.rows[0]);
    }

    async reactivate(email: string): Promise<Subscription> {
        const result = await getPool().query(
            `UPDATE toque.subscriptions
             SET is_active = TRUE, subscribed_at = CURRENT_TIMESTAMP
             WHERE email = $1
             RETURNING *`,
            [email]
        );
        return toCamelCase(result.rows[0]);
    }

    async unsubscribe(email: string): Promise<boolean> {
        const result = await getPool().query(
            `UPDATE toque.subscriptions
             SET is_active = FALSE
             WHERE email = $1 AND is_active = TRUE
             RETURNING id`,
            [email]
        );
        return (result.rowCount ?? 0) > 0;
    }
}