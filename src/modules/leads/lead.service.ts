import { LeadRepository } from "./lead.repository.js";
import { CreateLeadDTO } from "./lead.model.js";

export class LeadService {
    private repository: LeadRepository;

    constructor() {
        this.repository = new LeadRepository();
        // Inicializar tabla asíncronamente
        this.repository.createTableIfNotExists().catch(console.error);
    }

    async createLead(dto: CreateLeadDTO) {
        if (!dto.pageId || !dto.formData) {
            throw new Error("Datos inválidos para crear contacto");
        }
        return this.repository.create(dto);
    }

    async getLeadsByPage(pageId: string, status?: string) {
        return this.repository.findAllByPage(pageId, status);
    }

    async getAllLeads(status?: string) {
        return this.repository.findAll(status);
    }

    async updateLeadStatus(id: string, status: string) {
        return this.repository.updateStatus(id, status);
    }
}
