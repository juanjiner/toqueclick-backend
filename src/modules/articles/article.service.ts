import { StorageService } from "../../services/storage.service.js";
import { Article } from "./article.model.js";
import { ArticleRepository } from "./article.repository.js";

export class ArticleService {

    private repository = new ArticleRepository();
    private storage = new StorageService();
    private folder = "blog";

    getArticles(): Promise<Article[]> {
        return this.repository.findAll();
    }

    getById(id: string): Promise<Article | null> {
        return this.repository.findById(id);
    }

    async createArticle(data: Article, file: Express.Multer.File): Promise<Article> {
        const imageUrl = await this.storage.uploadFile(file, this.folder);
        return this.repository.create({ ...data, imageUrl });
    }

    async updateArticle(id: string, data: Article, file?: Express.Multer.File): Promise<Article | null> {
        const existing = await this.repository.findById(id);
        if (!existing) return null;

        let imageUrl = existing.imageUrl;

        if (file) {
            await this.storage.deleteFile(existing.imageUrl);
            imageUrl = await this.storage.uploadFile(file, this.folder);
        }

        return this.repository.update(id, { ...data, imageUrl });
    }

    async deleteArticle(id: string) {
        const existing = await this.repository.findById(id);

        if (existing?.imageUrl) {
            await this.storage.deleteFile(existing.imageUrl);
        }

        await this.repository.delete(id);
    }
}