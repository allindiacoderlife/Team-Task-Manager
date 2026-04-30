import { config } from "../../config/app.config.js";
import prisma from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { otpEmailTemplate, transporter } from "../../lib/mailer.js";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../../utils/appError.js";

export class AuthService {
  async register({ name, email, password, role = "USER" }) {
    if (!email || !password || !name) {
      throw new BadRequestError("Email, password, and name are required");
    }
    if (password.length < 8) {
      throw new BadRequestError("Password must be at least 8 characters long");
    }
    const normalizedEmail = email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new BadRequestError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(
      password,
      config.security.saltRounds,
    );

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return { success: true, message: "Admin registered successfully" };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid password");
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, config.security.jwtSecret, {
      expiresIn: "7d",
    });

    return {
      success: true,
      message: "Admin logged in successfully",
      user: payload,
      token,
    };
  }

  async sendEmailOtp(email, type) {
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) throw new NotFoundError("User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, config.security.saltRounds);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    try {
      // Save hashed OTP to database
      await prisma.otp.create({
        data: {
          email: normalizedEmail,
          code: hashedOtp,
          type: type,
          expiresAt: expiresAt,
          users: {
            connect: { id: user.id },
          },
        },
      });

      // Send plain OTP via email
      await transporter.sendMail({
        from: config.smtp.user,
        to: normalizedEmail,
        subject:
          type === "LOGIN" ? "Login Verification Code" : "Password Reset Code",
        html: otpEmailTemplate(otp),
      });

      return { success: true, message: "OTP sent successfully" };
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      throw new Error(
        "Failed to send verification email. Please try again later.",
      );
    }
  }

  async verifyOtpAndLogin({ email, code }) {
    const normalizedEmail = email.toLowerCase();
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email: normalizedEmail,
        type: "LOGIN",
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      include: { users: true },
    });

    if (!otpRecord || otpRecord.users.length === 0) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    // Verify hashed OTP
    const isOtpValid = await bcrypt.compare(code, otpRecord.code);
    if (!isOtpValid) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    const user = otpRecord.users[0];

    // Delete OTP after successful use
    await prisma.otp.delete({ where: { id: otpRecord.id } });

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, config.security.jwtSecret, {
      expiresIn: "7d",
    });

    return {
      success: true,
      message: "Logged in successfully with OTP",
      user: payload,
      token,
    };
  }

  async forgotPassword(email) {
    return await this.sendEmailOtp(email, "RESET_PASSWORD");
  }

  async resetPassword({ email, code, newPassword }) {
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestError(
        "New password must be at least 8 characters long",
      );
    }

    const normalizedEmail = email.toLowerCase();
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email: normalizedEmail,
        type: "RESET_PASSWORD",
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      include: { users: true },
    });

    if (!otpRecord || otpRecord.users.length === 0) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    // Verify hashed OTP
    const isOtpValid = await bcrypt.compare(code, otpRecord.code);
    if (!isOtpValid) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    const user = otpRecord.users[0];
    const hashedPassword = await bcrypt.hash(
      newPassword,
      config.security.saltRounds,
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete OTP after successful use
    await prisma.otp.delete({ where: { id: otpRecord.id } });

    return {
      success: true,
      message: "Password reset successfully",
    };
  }
}
