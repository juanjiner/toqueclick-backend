import { Request, Response } from "express";
import { CityService } from "./city.service.js";
import { successResponse } from "../../utils/apiResponse.js";

export class DepartamentController {

    private service = new CityService();

    getDepartaments = async (_req: Request, res: Response) => {
        const departaments = await this.service.getDepartaments();
        res.json(successResponse(departaments));
    };

    getDepartamentByCoordinates = async (_req: Request, res: Response) => {
        const longitud = String(_req.params.longitud);
        const latitud = String(_req.params.latitud);
        const departament = await this.service.getDepartamentByCoordinates(longitud, latitud);
        res.json(successResponse(departament));
    };

    getProvinces = async (_req: Request, res: Response) => {
        const departament = String(_req.params.departament);
        const provinces = await this.service.getProvinces(departament);
        res.json(successResponse(provinces));
    };

    getDistricts = async (_req: Request, res: Response) => {
        const province = String(_req.params.province);
        const districts = await this.service.getDistricts(province);
        res.json(successResponse(districts));
    };
}