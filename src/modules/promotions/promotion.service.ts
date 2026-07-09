import { StorageService } from "../../services/storage.service.js";
import { Promotion, PromoTypes, PurchaseTypes } from "./promotion.model.js";
import { PromotionRepository } from "./promotion.repository.js";
import * as xlsx from "xlsx";
import ExcelJS from "exceljs";

export class PromotionService {

    private repository = new PromotionRepository();
    private storage = new StorageService();
    private folder = "promotion";

    getPromotions(): Promise<Promotion[]> {
        return this.repository.findAll();
    }

    async createPromotion(promotion: Promotion, file: Express.Multer.File): Promise<Promotion> {
        const imageUrl = await this.storage.uploadFile(file, this.folder);
        return this.repository.create({ ...promotion, imageUrl });
    }

    async updatePromotion(id: string, promotion: Promotion, file?: Express.Multer.File): Promise<Promotion | null> {
        const existing = await this.repository.findById(id);
        if (!existing) return null;
        let imageUrl = existing.imageUrl;
        if (file) {
            await this.storage.deleteFile(existing.imageUrl);
            imageUrl = await this.storage.uploadFile(file, this.folder);
        }

        return this.repository.update(id, { ...promotion, imageUrl });
    }

    async incrementViews(id: string): Promise<void> {
        await this.repository.incrementViews(id);
    }

    async deletePromotion(id: string): Promise<void> {
        const existing = await this.repository.findById(id);

        if (existing?.imageUrl) {
            await this.storage.deleteFile(existing.imageUrl);
        }

        await this.repository.delete(id);
    }

    getPromoTypes(): Promise<PromoTypes[]> {
        return this.repository.findPromoTypes();
    }

    getPurchaseTypes(): Promise<PurchaseTypes[]> {
        return this.repository.findPurchaseTypes();
    }

    async exportExcel(): Promise<Buffer> {
        const promotions = await this.repository.findAllWithNames();
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Promociones");

        worksheet.columns = [
            { header: "Comercio", key: "businessName", width: 25 },
            { header: "Ciudad", key: "cityName", width: 18 },
            { header: "Título", key: "title", width: 25 },
            { header: "Descripción", key: "description", width: 35 },
            { header: "Precio Oferta", key: "promoPrice", width: 15 },
            { header: "Precio Original", key: "originalPrice", width: 15 },
            { header: "Tipo de Promo", key: "promoTypeName", width: 18 },
            { header: "Tipo de Compra", key: "purchaseTypeName", width: 18 },
            { header: "Expiración", key: "expirationDate", width: 18 },
            { header: "Campaña", key: "campaignName", width: 20 },
            { header: "Categoría Producto", key: "categoryName", width: 22 }
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
        promotions.forEach((p, index) => {
            const formattedExp = p.expirationDate ? new Date(p.expirationDate).toISOString().split('T')[0] : "";
            const row = worksheet.addRow({
                businessName: p.businessName || "",
                cityName: p.cityName || "",
                title: p.title,
                description: p.description || "",
                promoPrice: p.promoPrice,
                originalPrice: p.originalPrice || 0,
                promoTypeName: p.promoTypeName || "",
                purchaseTypeName: p.purchaseTypeName || "",
                expirationDate: formattedExp,
                campaignName: p.campaignName || "",
                categoryName: p.categoryName || ""
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

    async importExcel(file: Express.Multer.File): Promise<number> {
        const workbook = xlsx.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data: any[] = xlsx.utils.sheet_to_json(worksheet);

        let count = 0;
        for (const row of data) {
            const title = row["Título"] || row["Nombre"];
            const businessName = row["Comercio"] || row["Nombre del Comercio"];
            if (!title || !businessName) continue;

            const businessId = await this.repository.findBusinessByName(String(businessName));
            if (!businessId) continue; // Si no existe el comercio, saltamos la promoción

            const cityName = row["Ciudad"] || row["ID Ciudad"];
            const cityId = cityName ? await this.repository.findCityByName(String(cityName)) : null;

            const campaignName = row["Campaña"];
            const campaignId = campaignName ? await this.repository.findCampaignByName(String(campaignName)) : null;

            const categoryName = row["Categoría Producto"] || row["Categoría"];
            const productCategoryId = categoryName ? await this.repository.findProductCategoryByName(String(categoryName)) : null;

            const promoTypeName = row["Tipo de Promo"] || row["Tipo Promo"];
            const promoTypeId = promoTypeName ? await this.repository.findPromoTypeByName(String(promoTypeName)) : null;

            const purchaseTypeName = row["Tipo de Compra"] || row["Tipo Compra"];
            const purchaseTypeId = purchaseTypeName ? await this.repository.findPurchaseTypeByName(String(purchaseTypeName)) : null;

            const expirationVal = row["Expiración"] || row["Fecha Expiración"];
            let expirationDate: Date | null = null;
            if (expirationVal) {
                expirationDate = new Date(expirationVal);
            }

            const promotion: any = {
                businessNameId: businessId,
                cityId: cityId || "15", // Lima por defecto o fallback
                title: title,
                description: row["Descripción"] || "",
                promoPrice: parseFloat(row["Precio Oferta"] || "0") || 0,
                originalPrice: parseFloat(row["Precio Original"] || "0") || 0,
                promoTypeId: promoTypeId || "Descuento", // Se resolverá en repo o fallback
                purchaseTypeId: purchaseTypeId || "Local",
                startDate: new Date(),
                expirationDate: expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
                imageUrl: "static/promotion/local-fake-image-default.png", // Imagen por defecto
                campaignId: campaignId,
                productCategoryId: productCategoryId
            };

            await this.repository.create(promotion as Promotion);
            count++;
        }
        return count;
    }

    async generateTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Promociones");

        worksheet.columns = [
            { header: "Comercio", key: "businessName", width: 25 },
            { header: "Ciudad", key: "cityName", width: 18 },
            { header: "Título", key: "title", width: 25 },
            { header: "Descripción", key: "description", width: 35 },
            { header: "Precio Oferta", key: "promoPrice", width: 15 },
            { header: "Precio Original", key: "originalPrice", width: 15 },
            { header: "Tipo de Promo", key: "promoTypeName", width: 18 },
            { header: "Tipo de Compra", key: "purchaseTypeName", width: 18 },
            { header: "Expiración", key: "expirationDate", width: 18 },
            { header: "Campaña", key: "campaignName", width: 20 },
            { header: "Categoría Producto", key: "categoryName", width: 22 }
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

        // Notas informativas para las cabeceras
        worksheet.getCell("A1").note = "Nombre exacto del Comercio registrado en el sistema.";
        worksheet.getCell("B1").note = "Departamento de vigencia (ej: Lima, Arequipa).";
        worksheet.getCell("G1").note = "Opciones: Descuento, 2x1, Cashback, Combo.";
        worksheet.getCell("H1").note = "Opciones: Local, Online.";
        worksheet.getCell("I1").note = "Fecha en formato AAAA-MM-DD.";
        worksheet.getCell("J1").note = "Nombre de la Campaña (ej: Día de la Madre) si aplica.";
        worksheet.getCell("K1").note = "Opciones: Electrodomésticos, Ropa, Accesorios, Tecnología, Hogar.";

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}