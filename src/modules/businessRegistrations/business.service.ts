import { BusinessRegistration } from "./business.model.js";
import { BusinessRepository } from "./business.repository.js";
import ExcelJS from "exceljs";

export class BusinessService {

    private repository = new BusinessRepository();

    getBusinesses(limit: number, offset: number, search?: string) {
        return this.repository.findAll(limit, offset, search);
    }

    getById(id: string): Promise<BusinessRegistration | null> {
        return this.repository.findById(id);
    }

    getPendingBusinesses(): Promise<BusinessRegistration[]> {
        return this.repository.findPending();
    }

    createBusiness(data: BusinessRegistration): Promise<BusinessRegistration> {
        return this.repository.create({ ...data, status: "submitted" });
    }

    async updateBusiness(id: string, data: BusinessRegistration): Promise<BusinessRegistration | null> {
        const existing = await this.repository.findById(id);
        if (!existing) return null;
        return this.repository.update(id, data);
    }

    async updateStatus(id: string, status: string): Promise<BusinessRegistration | null> {
        const existing = await this.repository.findById(id);
        if (!existing) return null;
        return this.repository.updateStatus(id, status);
    }

    async deleteBusiness(id: string): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) return;
        await this.repository.delete(id);
    }

    async exportExcel(): Promise<Buffer> {
        const registrations = await this.repository.findAllWithNames();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Solicitudes");

        worksheet.columns = [
            { header: "Razón Social", key: "legalName", width: 25 },
            { header: "Nombre Comercial", key: "tradeName", width: 25 },
            { header: "RUC", key: "ruc", width: 15 },
            { header: "Rubro / Categoría", key: "categoryName", width: 22 },
            { header: "Departamento", key: "departamentName", width: 18 },
            { header: "Provincia", key: "provinceName", width: 18 },
            { header: "Distrito", key: "districtName", width: 18 },
            { header: "Contacto", key: "contactName", width: 22 },
            { header: "Cargo", key: "contactPosition", width: 18 },
            { header: "Teléfono", key: "phone", width: 15 },
            { header: "Email", key: "email", width: 25 },
            { header: "Dsctos Porcentuales", key: "benefitPercentageDiscounts", width: 20 },
            { header: "Promociones 2x1", key: "benefit2x1Promotions", width: 18 },
            { header: "Productos Gratis", key: "benefitFreeProducts", width: 18 },
            { header: "Puntos Fidelidad", key: "benefitLoyaltyPoints", width: 18 },
            { header: "Ofertas Exclusivas", key: "benefitExclusiveOffers", width: 18 },
            { header: "Comentarios", key: "additionalComments", width: 30 },
            { header: "Estado", key: "status", width: 15 },
            { header: "Fecha Solicitud", key: "createdAt", width: 20 }
        ];

        // Estilo de Cabecera
        const headerRow = worksheet.getRow(1);
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
            cell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFFFF" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0F8A8A" } };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                top: { style: "thin", color: { argb: "D1D5DB" } },
                left: { style: "thin", color: { argb: "D1D5DB" } },
                bottom: { style: "medium", color: { argb: "9CA3AF" } },
                right: { style: "thin", color: { argb: "D1D5DB" } }
            };
        });

        // Insertar filas
        registrations.forEach((r, index) => {
            const formattedDate = r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : "";
            const row = worksheet.addRow({
                legalName: r.legalName,
                tradeName: r.tradeName,
                ruc: r.ruc,
                categoryName: r.categoryName || "",
                departamentName: r.departamentName || "",
                provinceName: r.provinceName || "",
                districtName: r.districtName || "",
                contactName: r.contactName,
                contactPosition: r.contactPosition,
                phone: r.phone,
                email: r.email,
                benefitPercentageDiscounts: r.benefitPercentageDiscounts ? "SI" : "NO",
                benefit2x1Promotions: r.benefit2x1Promotions ? "SI" : "NO",
                benefitFreeProducts: r.benefitFreeProducts ? "SI" : "NO",
                benefitLoyaltyPoints: r.benefitLoyaltyPoints ? "SI" : "NO",
                benefitExclusiveOffers: r.benefitExclusiveOffers ? "SI" : "NO",
                additionalComments: r.additionalComments || "",
                status: r.status ? r.status.toUpperCase() : "PENDIENTE",
                createdAt: formattedDate
            });
            row.height = 22;

            const isEven = index % 2 === 0;
            const bgHex = isEven ? "F9FAFB" : "FFFFFF";

            row.eachCell((cell) => {
                cell.font = { name: "Segoe UI", size: 10, color: { argb: "1F2937" } };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgHex } };
                cell.alignment = { vertical: "middle", horizontal: "left" };
                cell.border = {
                    top: { style: "thin", color: { argb: "E5E7EB" } },
                    left: { style: "thin", color: { argb: "E5E7EB" } },
                    bottom: { style: "thin", color: { argb: "E5E7EB" } },
                    right: { style: "thin", color: { argb: "E5E7EB" } }
                };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}