import { StorageService } from "../../services/storage.service.js";
import { Business } from "./business.model.js";
import { BusinessRepository } from "./business.repository.js";

export class BusinessService {

    private repository = new BusinessRepository();
    private storage = new StorageService();
    private folder = "business";

    getBusinesses(): Promise<Business[]> {
        return this.repository.findAll();
    }

    async createBusiness(business: Business, file: Express.Multer.File): Promise<Business> {
        const logoUrl = await this.storage.uploadFile(file, this.folder);
        return this.repository.create({ ...business, logoUrl });
    }

    async updateBusiness(id: string, business: Business, file?: Express.Multer.File): Promise<Business | null> {
        const existing = await this.repository.findById(id);
        if (!existing) return null;

        let logoUrl = existing.logoUrl;

        if (file) {
            await this.storage.deleteFile(existing.logoUrl);
            logoUrl = await this.storage.uploadFile(file, this.folder);
        }

        return this.repository.update(id, { ...business, logoUrl });
    }

    async deleteBusiness(id: string): Promise<void> {
        const existing = await this.repository.findById(id);
        if (existing?.logoUrl) {
            await this.storage.deleteFile(existing.logoUrl);
        }
        await this.repository.delete(id);
    }
}