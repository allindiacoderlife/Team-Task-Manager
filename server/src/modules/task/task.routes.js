import { Router } from "express";
import { TaskController } from "./task.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();
const taskController = new TaskController();

router.use(authenticate);

router.post("/", asyncHandler(taskController.create));
router.post("/bulk-status", asyncHandler(taskController.updateBulkStatus));
router.get("/my", asyncHandler(taskController.getMyTasks));
router.get("/project/:projectId", asyncHandler(taskController.getProjectTasks));
router.patch("/:id", asyncHandler(taskController.update));
router.get("/:id", asyncHandler(taskController.getById));
router.delete("/:id", asyncHandler(taskController.delete));

export default router;
