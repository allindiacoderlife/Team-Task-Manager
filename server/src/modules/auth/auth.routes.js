import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();
const authController = new AuthController();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post(
  "/send-otp",
  authenticate,
  asyncHandler(authController.sendEmailOtp),
);
router.post("/verify-otp", asyncHandler(authController.verifyOtpAndLogin));
router.post("/forgot-password", asyncHandler(authController.forgotPassword));
router.post(
  "/reset-password",
  authenticate,
  asyncHandler(authController.resetPassword),
);

export default router;
