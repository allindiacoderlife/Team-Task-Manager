import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import workspaceRoutes from "../modules/workspace/workspace.routes.js";
import projectRoutes from "../modules/project/project.routes.js";
import taskRoutes from "../modules/task/task.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import invitationRoutes from "../modules/invitation/invitation.routes.js";
import commentRoutes from "../modules/comment/comment.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/invitations", invitationRoutes);
router.use("/comments", commentRoutes);

export default router;
