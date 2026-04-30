import { Router } from "express";
import { CommentController } from "./comment.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();
const commentController = new CommentController();

router.use(authenticate);

router.post("/:taskId", asyncHandler(commentController.add));
router.get("/:taskId", asyncHandler(commentController.getByTask));
router.delete("/:id", asyncHandler(commentController.delete));

export default router;
