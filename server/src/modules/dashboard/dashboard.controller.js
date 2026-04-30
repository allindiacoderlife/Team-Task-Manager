import { DashboardService } from "./dashboard.service.js";

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(req, res) {
    const result = await dashboardService.getStats(req.user.id);
    res.json(result);
  }
}
