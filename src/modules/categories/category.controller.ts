import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse.js";
import { CategoryService } from "./category.service.js";

export class CategoryController {

    private service = new CategoryService();

    getBusinessCategories = async (_req: Request, res: Response) => {
        const businessCategories = await this.service.getBusinessCategories();
        res.json(successResponse(businessCategories));
    };

    getBlogCategories = async (_req: Request, res: Response) => {
        const blogCategories = await this.service.getBlogCategories();
        res.json(successResponse(blogCategories));
    };

    getFaqCategories = async (_req: Request, res: Response) => {
        const faqCategories = await this.service.getFaqCategories();
        res.json(successResponse(faqCategories));
    };
}