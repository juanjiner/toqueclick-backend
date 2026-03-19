import { Legal } from "./legal.model.js";
import { LegalRepository } from "./legal.repository.js";

export class LegalService {

    private repository = new LegalRepository();

    getLegal(): Promise<Legal> {
        return this.repository.findLegal();
    }

    createLegal(legal: Legal): Promise<Legal> {
        return this.repository.create(legal);
    }

    updateLegal(id: string, legal: Legal): Promise<Legal | null> {
        return this.repository.update(id, legal);
    }
}