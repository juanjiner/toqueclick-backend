import { Business } from "./business.model.js";
import { BusinessRepository } from "./business.repository.js";

export class BusinessService {

    private repository = new BusinessRepository();

    getBusinesses(): Promise<Business[]> {
        return this.repository.findAll();
    }

    createBusiness(business: Business): Promise<Business> {
        return this.repository.create(business);
    }

    updateBusiness(id: string, business: Business): Promise<Business | null> {
        return this.repository.update(id, business);
    }

    deleteBusiness(id: string): Promise<void> {
        return this.repository.delete(id);
    }
}