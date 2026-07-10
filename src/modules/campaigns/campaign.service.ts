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
        const banners = data.banners || [];
        let fileIndex = 0;

        for (const banner of banners) {
            if ((!banner.imageUrl || banner.imageUrl.trim() === '') && files && fileIndex < files.length) {
                banner.imageUrl = await this.storage.uploadFile(files[fileIndex], "campaigns");
                fileIndex++;
            }
        }
        return this.repository.create({ ...data, banners });
    }

    async updateCampaign(id: string, data: UpdateCampaignDTO, files?: Express.Multer.File[]) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new AppError("Campaña no encontrada", 404);
        }

        const banners = data.banners || [];
        let fileIndex = 0;

        for (const banner of banners) {
            if ((!banner.imageUrl || banner.imageUrl.trim() === '') && files && fileIndex < files.length) {
                banner.imageUrl = await this.storage.uploadFile(files[fileIndex], "campaigns");
                fileIndex++;
            }
        }

        const campaign = await this.repository.update(id, { ...data, banners });
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
