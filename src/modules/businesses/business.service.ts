import { StorageService } from "../../services/storage.service.js";
import { Business } from "./business.model.js";
import { BusinessRepository } from "./business.repository.js";
import * as xlsx from "xlsx";
import { AppError } from "../../utils/AppError.js";
import ExcelJS from "exceljs";

export class BusinessService {

    private repository = new BusinessRepository();
    private storage = new StorageService();
    private folder = "business";

    getBusinesses(): Promise<Business[]> {
        return this.repository.findAll();
    }

    async createBusiness(business: Business, file: Express.Multer.File): Promise<Business> {
        const logoUrl = await this.storage.uploadFile(file, this.folder);
        return this.repository.create({ ...business, logoUrl });
    }

    async updateBusiness(id: string, business: Business, file?: Express.Multer.File): Promise<Business | null> {
        const existing = await this.repository.findById(id);
        if (!existing) return null;

        let logoUrl = existing.logoUrl;

        if (file) {
            await this.storage.deleteFile(existing.logoUrl);
            logoUrl = await this.storage.uploadFile(file, this.folder);
        }

        return this.repository.update(id, { ...business, logoUrl });
    }

    async approveBusiness(id: string): Promise<Business | null> {
        const existing = await this.repository.findById(id);
        if (!existing) return null;
        if (!existing.cityId || !existing.categoryId) {
            throw new AppError("No se puede aprobar un comercio sin ciudad o categoría asignada", 400);
        }
        return this.repository.approve(id);
    }

    async rejectBusiness(id: string): Promise<Business | null> {
        return this.repository.reject(id);
    }

    async deleteBusiness(id: string): Promise<void> {
        const existing = await this.repository.findById(id);
        if (existing?.logoUrl) {
            await this.storage.deleteFile(existing.logoUrl);
        }
        await this.repository.delete(id);
    }

    async exportExcel(): Promise<Buffer> {
        const businesses = await this.repository.findAllWithNames();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Comercios");

        worksheet.columns = [
            { header: "Comercio", key: "businessName", width: 25 },
            { header: "Descripción", key: "description", width: 35 },
            { header: "Dirección", key: "address", width: 30 },
            { header: "Teléfono", key: "phone", width: 15 },
            { header: "Estado", key: "status", width: 15 },
            { header: "Ciudad", key: "city", width: 18 },
            { header: "Categoría", key: "category", width: 22 }
        ];

        // Estilo de Cabecera
        const headerRow = worksheet.getRow(1);
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
            cell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFFFF" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0F8A8A" } }; // Teal Oscuro
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                top: { style: "thin", color: { argb: "D1D5DB" } },
                left: { style: "thin", color: { argb: "D1D5DB" } },
                bottom: { style: "medium", color: { argb: "9CA3AF" } },
                right: { style: "thin", color: { argb: "D1D5DB" } }
            };
        });

        // Insertar filas
        businesses.forEach((b, index) => {
            const row = worksheet.addRow({
                businessName: b.businessName,
                description: b.description || "",
                address: b.address || "",
                phone: b.phone || "",
                status: b.status || "PENDIENTE",
                city: b.cityName || "",
                category: b.categoryName || ""
            });
            row.height = 22;

            // Zebra striping
            const isEven = index % 2 === 0;
            const bgHex = isEven ? "F9FAFB" : "FFFFFF";

            row.eachCell((cell, colNumber) => {
                cell.font = { name: "Segoe UI", size: 10, color: { argb: "1F2937" } };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgHex } };
                cell.alignment = { vertical: "middle", horizontal: colNumber === 4 || colNumber === 5 ? "center" : "left" };
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

    async importExcel(file: Express.Multer.File): Promise<number> {
        const workbook = xlsx.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data: any[] = xlsx.utils.sheet_to_json(worksheet);

        let count = 0;
        for (const row of data) {
            const businessName = row["Comercio"] || row["Nombre del Comercio"];
            if (!businessName) continue;

            let cityId: string | null = null;
            const cityName = row["Ciudad"] || row["ID Ciudad"];
            if (cityName) {
                cityId = await this.repository.findCityByName(String(cityName));
            }

            let categoryId: string | null = null;
            const categoryName = row["Categoría"] || row["ID Categoría"];
            if (categoryName) {
                categoryId = await this.repository.findCategoryByName(String(categoryName));
            }

            const business: any = {
                businessName: businessName,
                description: row["Descripción"] || "",
                address: row["Dirección"] || "",
                phone: row["Teléfono"] || "",
                status: row["Estado"] || "PENDIENTE",
                cityId: cityId,
                categoryId: categoryId
            };

            await this.repository.create(business as Business);
            count++;
        }
        return count;
    }

    async generateTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Comercios");

        worksheet.columns = [
            { header: "Comercio", key: "businessName", width: 25 },
            { header: "Descripción", key: "description", width: 35 },
            { header: "Dirección", key: "address", width: 30 },
            { header: "Teléfono", key: "phone", width: 15 },
            { header: "Estado", key: "status", width: 15 },
            { header: "Ciudad", key: "city", width: 18 },
            { header: "Categoría", key: "category", width: 22 }
        ];

        // Estilo de Cabecera
        const headerRow = worksheet.getRow(1);
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
            cell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFFFF" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0D9488" } }; // Teal #0D9488
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                top: { style: "thin", color: { argb: "D1D5DB" } },
                left: { style: "thin", color: { argb: "D1D5DB" } },
                bottom: { style: "medium", color: { argb: "9CA3AF" } },
                right: { style: "thin", color: { argb: "D1D5DB" } }
            };
        });

        // Notas a los encabezados
        worksheet.getCell("E1").note = {
            texts: [
                { font: { bold: true, size: 9, color: { argb: "101828" }, name: "Segoe UI" }, text: "Estado:\n" },
                { font: { size: 9, color: { argb: "4A5565" }, name: "Segoe UI" }, text: "Opciones válidas: PENDIENTE, APROBADO o RECHAZADO." }
            ]
        };

        worksheet.getCell("F1").note = {
            texts: [
                { font: { bold: true, size: 9, color: { argb: "101828" }, name: "Segoe UI" }, text: "Ciudad:\n" },
                { font: { size: 9, color: { argb: "4A5565" }, name: "Segoe UI" }, text: "Ingrese el nombre completo del Departamento (ej: Lima, Arequipa).\nSi no existe, se guardará en blanco para asignarlo luego." }
            ]
        };

        worksheet.getCell("G1").note = {
            texts: [
                { font: { bold: true, size: 9, color: { argb: "101828" }, name: "Segoe UI" }, text: "Categoría:\n" },
                { font: { size: 9, color: { argb: "4A5565" }, name: "Segoe UI" }, text: "Ingrese el nombre completo de la Categoría de Comercio (ej: Restaurantes, Retail, Cafeterías).\nSi no existe, se guardará en blanco para asignarlo luego." }
            ]
        };

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}