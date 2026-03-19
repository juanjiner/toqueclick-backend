import { Promotion, PromoTypes, PurchaseTypes } from "./promotion.model.js";
import { PromotionRepository } from "./promotion.repository.js";

export class PromotionService {

    private repository = new PromotionRepository();

    getPromotions(): Promise<Promotion[]> {
        return this.repository.findAll();
    }

    createPromotion(promotion: Promotion): Promise<Promotion> {
        return this.repository.create(promotion);
    }

    updatePromotion(id: string, promotion: Promotion): Promise<Promotion | null> {
        return this.repository.update(id, promotion);
    }

    deletePromotion(id: string): Promise<void> {
        return this.repository.delete(id);
    }

    getPromoTypes(): Promise<PromoTypes[]> {
        return this.repository.findPromoTypes();
    }

    getPurchaseTypes(): Promise<PurchaseTypes[]> {
        return this.repository.findPurchaseTypes();
    }
}