import { Router } from "express";
import { ProjectController } from "./project.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();
const projectController = new ProjectController();

router.use(authenticate);

router.post("/", asyncHandler(projectController.create));
router.get("/my", asyncHandler(projectController.getMyProjects));
router.post("/:id/members", asyncHandler(projectController.addMember));
router.delete("/:id/members/:userId", asyncHandler(projectController.removeMember));

export default router;
