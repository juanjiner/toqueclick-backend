import { Maintenance } from "./maintenance.model.js";
import { MaintenanceRepository } from "./maintenance.repository.js";

export class MaintenanceService {

    private repository = new MaintenanceRepository();

    getMaintenance(): Promise<Maintenance> {
        return this.repository.findMaintenance();
    }

    createMaintenance(maintenance: Maintenance): Promise<Maintenance> {
        return this.repository.create(maintenance);
    }

    updateMaintenance(id: string, maintenance: Maintenance): Promise<Maintenance | null> {
        return this.repository.update(id, maintenance);
    }
}