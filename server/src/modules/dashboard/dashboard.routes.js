import { Router } from "express";
import { DashboardController } from "./dashboard.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);

router.get("/stats", asyncHandler(dashboardController.getStats));

export default router;
