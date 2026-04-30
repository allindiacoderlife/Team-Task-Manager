import { Router } from "express";
import { WorkspaceController } from "./workspace.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();
const workspaceController = new WorkspaceController();

router.use(authenticate);

router.post("/", asyncHandler(workspaceController.create));
router.get("/my", asyncHandler(workspaceController.getMyWorkspaces));
router.get("/:id", asyncHandler(workspaceController.getById));
router.post("/:id/members", asyncHandler(workspaceController.addMember));
router.delete("/:id/members/:memberId", asyncHandler(workspaceController.removeMember));

export default router;
