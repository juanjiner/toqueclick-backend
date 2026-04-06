import { DashboardRepository } from "./dashboard.repository.js";

export class DashboardService {
    private repo = new DashboardRepository();

    async getSummary() {
        const [stats, activity, topPromos, topCities] = await Promise.all([
            this.repo.getStats(),
            this.repo.getRecentActivity(),
            this.repo.getTopPromos(),
            this.repo.getTopCities(),
        ]);

        return { stats, activity, topPromos, topCities };
    }
}