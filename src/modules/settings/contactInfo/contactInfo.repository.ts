import { getPool } from "../../../config/database.js";
import { toCamelCase } from "../../../utils/camelCase.js";
import { ContactInfo } from "./contactInfo.model.js";

export class ContactInfoRepository {

    async findContactInfo(): Promise<ContactInfo> {

        const result = await getPool().query(
            "SELECT * FROM toque.contact_info"
        );

        return toCamelCase(result.rows[0] || null);
    }

    async create(contactInfo: ContactInfo): Promise<ContactInfo> {
        const result = await getPool().query(
            `
        INSERT INTO toque.contact_info 
        (contact_email, support_phone, support_whatsapp, schedule)
        VALUES ($1,$2,$3,$4)
        RETURNING *
        `,
            [contactInfo.contactEmail, contactInfo.supportPhone, contactInfo.supportWhatsapp, contactInfo.schedule]
        );

        return toCamelCase(result.rows[0]);
    }

    async update(id: string, contactInfo: ContactInfo): Promise<ContactInfo | null> {
        const result = await getPool().query(
            `
        UPDATE toque.contact_info
        SET 
            contact_email=$1,
            support_phone=$2,
            support_whatsapp=$3,
            schedule=$4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id=$5
        RETURNING *
        `,
            [contactInfo.contactEmail, contactInfo.supportPhone, contactInfo.supportWhatsapp, contactInfo.schedule, id]
        );

        return toCamelCase(result.rows[0] || null);
    }
}