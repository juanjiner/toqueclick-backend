import { AppError } from "../../utils/AppError.js";
import { SubscriptionRepository } from "./subscription.repository.js";
import { Subscription } from "./subscription.model.js";

export class SubscriptionService {

    private repository = new SubscriptionRepository();

    async subscribe(rawEmail: string): Promise<Subscription> {
        const email = rawEmail.trim().toLowerCase();

        const existing = await this.repository.findByEmail(email);

        if (existing) {
            if (existing.isActive) {
                throw new AppError("Este correo ya está suscrito", 409);
            }
            // Si estaba desuscrito antes, se reactiva
            return this.repository.reactivate(email);
        }

        return this.repository.create(email);
    }

    async unsubscribe(rawEmail: string): Promise<void> {
        const email = rawEmail.trim().toLowerCase();
        const removed = await this.repository.unsubscribe(email);

        if (!removed) {
            throw new AppError("Correo no encontrado o ya desuscrito", 404);
        }
    }
}