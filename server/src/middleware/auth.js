import jwt from "jsonwebtoken";
import { config } from "../config/app.config.js";
import { UnauthorizedError } from "../utils/appError.js";

/**
 * Auth middleware - Protects routes by verifying JWT token
 */
export const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // throw new Error("Unauthorized: No token provided");
    // Let's call next(error) instead of throwing to be safe with express 4 error handling
    // actually throwing inside sync middleware is caught by express, and we use asyncHandler usually?
    // Wait, this middleware is not wrapped in asyncHandler properly in routes yet.
    // But since it's synchronous logic mostly (jwt.verify), throwing is okay if express catches it.
    // However, the existing code structure uses try/catch or asyncHandler.
    // The previous code threw Error. I'll stick to that but import AppError if available or just Error.
    return next(new UnauthorizedError("No token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = config.security.jwtSecret;
    if (!secret) {
      return next(
        new Error("Internal Server Error: JWT Secret not configured"),
      );
    }
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new UnauthorizedError("Invalid token"));
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles) => {
  return (req, _res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return next(new Error("Forbidden: Insufficient permissions"));
    }
    next();
  };
};
