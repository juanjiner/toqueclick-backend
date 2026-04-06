import { getPool } from "../../config/database.js";
import { Departament, Province, District } from "./city.model.js";

export class CityRepository {

    async findDepartaments(): Promise<Departament[]> {
        const result = await getPool().query(
            "SELECT id, departament FROM maestro.departament ORDER BY departament");
        return result.rows;
    }

    async findDepartamentByCoordinates(longitud: string, latitud: string): Promise<Departament> {
        const result = await getPool().query(
            `SELECT id, departament
            FROM maestro.departament
            WHERE ST_Contains(d.geom, ST_SetSRID(ST_MakePoint($1, $2), 4326))`,
            [longitud, latitud]
        );
        return result.rows[0];
    }

    async findProvincesByDepartament(department: string): Promise<Province[]> {
        const result = await getPool().query(
            "SELECT id, province FROM maestro.province WHERE ccdd= $1 ORDER BY province",
            [department]
        );
        return result.rows;
    }

    async findDistrictsByProvince(province: string): Promise<District[]> {
        const result = await getPool().query(
            "SELECT id, district FROM maestro.district WHERE ccpp= $1 ORDER BY district",
            [province]
        );
        return result.rows;
    }
}