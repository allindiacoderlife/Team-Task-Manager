import { Router } from "express";
import { InvitationController } from "./invitation.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();
const invitationController = new InvitationController();

router.use(authenticate);

router.post("/workspace/:workspaceId", asyncHandler(invitationController.inviteToWorkspace));
router.post("/project/:projectId", asyncHandler(invitationController.inviteToProject));
router.post("/accept", asyncHandler(invitationController.acceptInvitation));
router.get("/:token", asyncHandler(invitationController.getInvitation));

export default router;
