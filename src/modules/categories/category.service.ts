import { BusinessCategory } from "./category.model.js";
import { CategoryRepository } from "./category.repository.js";

export class CategoryService {

    private repository = new CategoryRepository();

    getBusinessCategories() {
        return this.repository.findBusinessCategories();
    }

    async createBusinessCategory(business: BusinessCategory): Promise<BusinessCategory> {
        return this.repository.create(business);
    }

    getBlogCategories() {
        return this.repository.findBlogCategories();
    }

    getFaqCategories() {
        return this.repository.findFaqCategories();
    }
}