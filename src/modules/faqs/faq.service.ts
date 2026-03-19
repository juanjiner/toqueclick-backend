import { Faq } from "./faq.model.js";
import { FaqRepository } from "./faq.repository.js";

export class FaqService {

    private repository = new FaqRepository();

    getFaqs(): Promise<Faq[]> {
        return this.repository.findAll();
    }

    createFaq(Faq: Faq): Promise<Faq> {
        return this.repository.create(Faq);
    }

    updateFaq(id: string, Faq: Faq): Promise<Faq | null> {
        return this.repository.update(id, Faq);
    }

    deleteFaq(id: string): Promise<void> {
        return this.repository.delete(id);
    }
}