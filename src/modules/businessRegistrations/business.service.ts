import { BusinessRegistration } from "./business.model.js";
import { BusinessRepository } from "./business.repository.js";

export class BusinessService {

    private repository = new BusinessRepository();

    getBusinesses(limit: number, offset: number, search?: string) {
        return this.repository.findAll(limit, offset, search);
    }

    getById(id: string): Promise<BusinessRegistration | null> {
        return this.repository.findById(id);
    }

    getPendingBusinesses(): Promise<BusinessRegistration[]> {
        return this.repository.findPending();
    }

    createBusiness(data: BusinessRegistration): Promise<BusinessRegistration> {
        return this.repository.create({ ...data, status: "submitted" });
    }

    async updateBusiness(id: string, data: BusinessRegistration): Promise<BusinessRegistration | null> {
        const existing = await this.repository.findById(id);
        if (!existing) return null;
        return this.repository.update(id, data);
    }

    async updateStatus(id: string, status: string): Promise<BusinessRegistration | null> {
        const existing = await this.repository.findById(id);
        if (!existing) return null;
        return this.repository.updateStatus(id, status);
    }

    async deleteBusiness(id: string): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) return;
        await this.repository.delete(id);
    }
}