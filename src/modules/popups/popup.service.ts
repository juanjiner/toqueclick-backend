import { PopupRepository } from './popup.repository.js';
import { CreatePopupDTO, UpdatePopupDTO, Popup } from './popup.model.js';

export class PopupService {
    private repository: PopupRepository;

    constructor() {
        this.repository = new PopupRepository();
    }

    async getAllPopups(): Promise<Popup[]> {
        return this.repository.findAll();
    }

    async getPopupById(id: string): Promise<Popup | null> {
        return this.repository.findById(id);
    }

    async getActivePopupsForPage(pagePath: string): Promise<Popup[]> {
        const activePopups = await this.repository.findActivePopups();
        
        return activePopups.filter(popup => {
            const rules = popup.displayRules;
            if (!rules || !rules.targetPages || rules.targetPages.length === 0) {
                return true;
            }
            
            if (rules.targetPages.includes('*')) {
                return true;
            }

            return rules.targetPages.some(target => {
                if (target === pagePath) return true;
                if (target.endsWith('/*')) {
                    const basePath = target.replace('/*', '');
                    if (pagePath === basePath || pagePath.startsWith(basePath + '/')) {
                        return true;
                    }
                }
                return false;
            });
        });
    }

    async createPopup(dto: CreatePopupDTO): Promise<Popup> {
        return this.repository.create(dto);
    }

    async updatePopup(id: string, dto: UpdatePopupDTO): Promise<Popup | null> {
        return this.repository.update(id, dto);
    }

    async deletePopup(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }
}
