import { CategoryRepository } from "./category.repository.js";

export class CategoryService {

    private repository = new CategoryRepository();

    getBusinessCategories() {
        return this.repository.findBusinessCategories();
    }

    getBlogCategories() {
        return this.repository.findBlogCategories();
    }

    getFaqCategories() {
        return this.repository.findFaqCategories();
    }

    getProductCategories() {
        return this.repository.findProductCategories();
    }
}