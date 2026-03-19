import { ContactInfo } from "./contactInfo.model.js";
import { ContactInfoRepository } from "./contactInfo.repository.js";

export class ContactInfoService {

    private repository = new ContactInfoRepository();

    getContactInfo(): Promise<ContactInfo> {
        return this.repository.findContactInfo();
    }

    createContactInfo(contactInfo: ContactInfo): Promise<ContactInfo> {
        return this.repository.create(contactInfo);
    }

    updateContactInfo(id: string, contactInfo: ContactInfo): Promise<ContactInfo | null> {
        return this.repository.update(id, contactInfo);
    }
}