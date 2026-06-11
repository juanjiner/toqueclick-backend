import { CampaignRepository } from "./campaign.repository.js";
import { CreateCampaignDTO, UpdateCampaignDTO } from "./campaign.model.js";
import { AppError } from "../../utils/AppError.js";
import { StorageService } from "../../services/storage.service.js";

export class CampaignService {

    private repository = new CampaignRepository();
    private storage = new StorageService();

    async getAllCampaigns() {
        return this.repository.findAll();
    }

    async getCampaignById(id: string) {
        const campaign = await this.repository.findById(id);
        if (!campaign) {
            throw new AppError("Campaña no encontrada", 404);
        }
        return campaign;
    }

    async createCampaign(data: CreateCampaignDTO, file?: Express.Multer.File) {
        let coverImageUrl = data.coverImageUrl || null;
        if (file) {
            coverImageUrl = await this.storage.uploadFile(file, "campaigns");
        }
        return this.repository.create({ ...data, coverImageUrl });
    }

    async updateCampaign(id: string, data: UpdateCampaignDTO, file?: Express.Multer.File) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new AppError("Campaña no encontrada", 404);
        }
        let coverImageUrl = data.coverImageUrl !== undefined ? data.coverImageUrl : existing.coverImageUrl;
        if (file) {
            if (existing.coverImageUrl) {
                await this.storage.deleteFile(existing.coverImageUrl);
            }
            coverImageUrl = await this.storage.uploadFile(file, "campaigns");
        }
        const campaign = await this.repository.update(id, { ...data, coverImageUrl });
        if (!campaign) {
            throw new AppError("Campaña no encontrada", 404);
        }
        return campaign;
    }

    async deleteCampaign(id: string) {
        const campaign = await this.repository.findById(id);
        if (!campaign) {
            throw new AppError("Campaña no encontrada", 404);
        }
        await this.repository.delete(id);
    }
}
