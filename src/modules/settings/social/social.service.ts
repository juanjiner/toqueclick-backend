import { Social } from "./social.model.js";
import { SocialRepository } from "./social.repository.js";

export class SocialService {

    private repository = new SocialRepository();

    getSocial(): Promise<Social> {
        return this.repository.findSocial();
    }

    createSocial(social: Social): Promise<Social> {
        return this.repository.create(social);
    }

    updateSocial(id: string, social: Social): Promise<Social | null> {
        return this.repository.update(id, social);
    }
}