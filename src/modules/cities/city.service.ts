import { Departament, District, Province } from "./city.model.js";
import { CityRepository } from "./city.repository.js";

export class CityService {

    private repository = new CityRepository();

    getDepartaments(): Promise<Departament[]> {
        return this.repository.findDepartaments();
    }

    getProvinces(departament: string): Promise<Province[]> {
        return this.repository.findProvincesByDepartament(departament);
    }

    getDistricts(province: string): Promise<District[]> {
        return this.repository.findDistrictsByProvince(province);
    }
}