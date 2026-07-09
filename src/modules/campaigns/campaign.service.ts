import { CampaignRepository } from "./campaign.repository.js";
import { CreateCampaignDTO, UpdateCampaignDTO } from "./campaign.model.js";
import { AppError } from "../../utils/AppError.js";
import { StorageService } from "../../services/storage.service.js";

export class CampaignService {

    private repository = new CampaignRepository();
    private storage = new StorageService();

    async getAllCampaigns(activeOnly: boolean = false) {
        return this.repository.findAll(activeOnly);
    }

    async getCampaignById(id: string) {
        const campaign = await this.repository.findById(id);
        if (!campaign) {
            throw new AppError("Campaña no encontrada", 404);
        }
        return campaign;
    }

    async createCampaign(data: CreateCampaignDTO, files?: Express.Multer.File[]) {
        let bannerImageUrls: string[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const url = await this.storage.uploadFile(file, "campaigns");
                bannerImageUrls.push(url);
            }
        }
        return this.repository.create({ ...data, bannerImageUrls });
    }

    async updateCampaign(id: string, data: UpdateCampaignDTO, files?: Express.Multer.File[]) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new AppError("Campaña no encontrada", 404);
        }

        // If data.bannerImageUrls is provided (e.g. they kept some old ones), we start with those
        let bannerImageUrls: string[] = data.bannerImageUrls || existing.bannerImageUrls || [];

        // Upload new files and append to the array
        if (files && files.length > 0) {
            for (const file of files) {
                const url = await this.storage.uploadFile(file, "campaigns");
                bannerImageUrls.push(url);
            }
        }

        const campaign = await this.repository.update(id, { ...data, bannerImageUrls });
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
