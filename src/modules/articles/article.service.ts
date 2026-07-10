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

    async getPresignedUploadUrl(filename: string, contentType: string, fileSize: number): Promise<{ uploadUrl: string; key: string }> {
        return await this.storage.getPresignedUrl(filename, contentType, fileSize, this.folder);
    }

    async createArticle(
        data: Article,
        files: { image?: Express.Multer.File; audio?: Express.Multer.File; video?: Express.Multer.File }
    ): Promise<Article> {
        let imageUrl = data.imageUrl || "";
        if (files.image) {
            imageUrl = await this.storage.uploadFile(files.image, this.folder);
        }

        let audioUrl: string | null = data.audioUrl || null;
        if (files.audio) {
            audioUrl = await this.storage.uploadFile(files.audio, this.folder);
        }

        let videoUrl: string | null = data.videoUrl || null;
        if (files.video) {
            videoUrl = await this.storage.uploadFile(files.video, this.folder);
        }

        return this.repository.create({ ...data, imageUrl, audioUrl, videoUrl });
    }

    async updateArticle(
        id: string,
        data: Article,
        files: { image?: Express.Multer.File; audio?: Express.Multer.File; video?: Express.Multer.File }
    ): Promise<Article | null> {
        const existing = await this.repository.findById(id);
        if (!existing) return null;

        let imageUrl = data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl;
        if (files.image) {
            await this.storage.deleteFile(existing.imageUrl);
            imageUrl = await this.storage.uploadFile(files.image, this.folder);
        }

        let audioUrl = data.audioUrl !== undefined ? data.audioUrl : existing.audioUrl;
        if (files.audio) {
            if (existing.audioUrl) {
                await this.storage.deleteFile(existing.audioUrl);
            }
            audioUrl = await this.storage.uploadFile(files.audio, this.folder);
        } else if (data.audioUrl === '' || data.audioUrl === null || data.audioUrl === 'null') {
            if (existing.audioUrl) {
                await this.storage.deleteFile(existing.audioUrl);
            }
            audioUrl = null;
        }

        let videoUrl = data.videoUrl !== undefined ? data.videoUrl : existing.videoUrl;
        if (files.video) {
            if (existing.videoUrl) {
                await this.storage.deleteFile(existing.videoUrl);
            }
            videoUrl = await this.storage.uploadFile(files.video, this.folder);
        } else if (data.videoUrl === '' || data.videoUrl === null || data.videoUrl === 'null') {
            if (existing.videoUrl) {
                await this.storage.deleteFile(existing.videoUrl);
            }
            videoUrl = null;
        }

        return this.repository.update(id, { ...data, imageUrl, audioUrl, videoUrl });
    }

    async deleteArticle(id: string) {
        const existing = await this.repository.findById(id);

        if (existing) {
            if (existing.imageUrl) {
                await this.storage.deleteFile(existing.imageUrl);
            }
            if (existing.audioUrl) {
                await this.storage.deleteFile(existing.audioUrl);
            }
            if (existing.videoUrl) {
                await this.storage.deleteFile(existing.videoUrl);
            }
        }

        await this.repository.delete(id);
    }
}