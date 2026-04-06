import { StorageService } from "../../services/storage.service.js";
import { Promotion, PromoTypes, PurchaseTypes } from "./promotion.model.js";
import { PromotionRepository } from "./promotion.repository.js";

export class PromotionService {

    private repository = new PromotionRepository();
    private storage = new StorageService();
    private folder = "promotion";

    getPromotions(): Promise<Promotion[]> {
        return this.repository.findAll();
    }

    async createPromotion(promotion: Promotion, file: Express.Multer.File): Promise<Promotion> {
        const imageUrl = await this.storage.uploadFile(file, this.folder);
        return this.repository.create({ ...promotion, imageUrl });
    }

    async updatePromotion(id: string, promotion: Promotion, file?: Express.Multer.File): Promise<Promotion | null> {
        const existing = await this.repository.findById(id);
        if (!existing) return null;
        let imageUrl = existing.imageUrl;
        if (file) {
            await this.storage.deleteFile(existing.imageUrl);
            imageUrl = await this.storage.uploadFile(file, this.folder);
        }

        return this.repository.update(id, { ...promotion, imageUrl });
    }

    async incrementViews(id: string): Promise<void> {
        await this.repository.incrementViews(id);
    }

    async deletePromotion(id: string): Promise<void> {
        const existing = await this.repository.findById(id);

        if (existing?.imageUrl) {
            await this.storage.deleteFile(existing.imageUrl);
        }

        await this.repository.delete(id);
    }

    getPromoTypes(): Promise<PromoTypes[]> {
        return this.repository.findPromoTypes();
    }

    getPurchaseTypes(): Promise<PurchaseTypes[]> {
        return this.repository.findPurchaseTypes();
    }
}