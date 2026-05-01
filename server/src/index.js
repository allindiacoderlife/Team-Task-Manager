import "dotenv/config";
import express from "express";
import cors from "cors";
import { config } from "./config/app.config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import apiRoutes from "./routes/index.js";

const PORT = config.port;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({
      status: "Backend is running",
    });
  }),
);

app.get(
  "/api/health",
  asyncHandler(async (_req, res) => {
    res.json({
      status: "Backend is healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
    });
  }),
);

app.use("/api", apiRoutes);

app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
