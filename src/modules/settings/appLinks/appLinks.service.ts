import { AppLinks } from './appLinks.model.js';
import { AppLinksRepository } from './appLinks.repository.js';

export class AppLinksService {

    private repository = new AppLinksRepository();

    getAppLinks(): Promise<AppLinks> {
        return this.repository.getAppLinks();
    }

    createAppLinks(links: AppLinks): Promise<AppLinks> {
        return this.repository.create(links);
    }

    updateAppLinks(id: string, links: AppLinks): Promise<AppLinks | null> {
        return this.repository.update(id, links);
    }
}