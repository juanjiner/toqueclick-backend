import { StorageService } from '../../services/storage.service.js';
import { AppError } from '../../utils/AppError.js';
import {
    Page, PageSection, PageItem,
    UpdatePageDTO, UpsertSectionDTO,
    CreateItemDTO, UpdateItemDTO, ReorderItemsDTO,
    CreateFeatureDTO, PageItemFeature,
} from './page.model.js';
import { PageRepository } from './page.repository.js';

export class PageService {
    private repository = new PageRepository();
    private storage = new StorageService();
    private folder = 'pages';

    getAll(): Promise<Page[]> {
        return this.repository.findAll();
    }

    async getBySlug(slug: string): Promise<Page> {
        const page = await this.repository.findBySlugWithSections(slug);
        if (!page) throw new AppError('Página no encontrada', 404);
        return page;
    }

    async updatePage(slug: string, dto: UpdatePageDTO): Promise<Page> {
        const page = await this.repository.updatePage(slug, dto);
        if (!page) throw new AppError('Página no encontrada', 404);
        return page;
    }

    async upsertSection(slug: string, dto: UpsertSectionDTO, file?: Express.Multer.File): Promise<PageSection> {
        const page = await this.repository.findBySlug(slug);
        if (!page) throw new AppError('Página no encontrada', 404);

        let imageUrl = dto.imageUrl;

        if (file) {
            // Si ya tenía imagen, borra la anterior
            const existing = await this.repository.findBySlugWithSections(slug);
            const section = existing?.sections?.find(s => s.sectionKey === dto.sectionKey);
            if (section?.imageUrl) {
                await this.storage.deleteFile(section.imageUrl);
            }
            imageUrl = await this.storage.uploadFile(file, this.folder);
        }

        return this.repository.upsertSection(page.id, { ...dto, imageUrl });
    }

    async createItem(slug: string, sectionKey: string, dto: CreateItemDTO, file?: Express.Multer.File): Promise<PageItem> {
        const page = await this.repository.findBySlugWithSections(slug);
        if (!page) throw new AppError('Página no encontrada', 404);
        const section = page.sections?.find(s => s.sectionKey === sectionKey);
        if (!section) throw new AppError('Sección no encontrada', 404);

        let imageUrl = dto.imageUrl;
        if (file) {
            imageUrl = await this.storage.uploadFile(file, this.folder);
        }

        return this.repository.createItem(section.id, { ...dto, imageUrl });
    }

    async updateItem(id: string, dto: UpdateItemDTO, file?: Express.Multer.File): Promise<PageItem> {
        const existing = await this.repository.findItemById(id);
        if (!existing) throw new AppError('Item no encontrado', 404);

        let imageUrl = existing.imageUrl;
        if (file) {
            if (existing.imageUrl) await this.storage.deleteFile(existing.imageUrl);
            imageUrl = await this.storage.uploadFile(file, this.folder);
        }

        const item = await this.repository.updateItem(id, { ...dto, imageUrl });
        if (!item) throw new AppError('Item no encontrado', 404);
        return item;
    }

    deleteItem(id: string): Promise<void> {
        return this.repository.deleteItem(id);
    }

    reorderItems(dto: ReorderItemsDTO): Promise<void> {
        return this.repository.reorderItems(dto);
    }

    async createFeature(itemId: string, dto: CreateFeatureDTO): Promise<PageItemFeature> {
        return this.repository.createFeature(itemId, dto);
    }

    async deleteFeature(id: string): Promise<void> {
        return this.repository.deleteFeature(id);
    }
}