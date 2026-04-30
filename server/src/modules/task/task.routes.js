import { Router } from "express";
import { TaskController } from "./task.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();
const taskController = new TaskController();

router.use(authenticate);

router.post("/", asyncHandler(taskController.create));
router.patch("/:id/status", asyncHandler(taskController.updateStatus));
router.get("/my", asyncHandler(taskController.getMyTasks));
router.get("/project/:projectId", asyncHandler(taskController.getProjectTasks));

export default router;
