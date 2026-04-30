import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { config } from "../config/app.config.js";

const globalForPrisma = globalThis.prisma || new PrismaClient();

function createPrismaClient() {
  const connectionString = config.databaseUrl;
  const pool = new pg.Pool({
    connectionString,
    connectionTimeoutMillis: 10000, // 10 seconds to establish connection
    idleTimeoutMillis: 30000,
    max: 20, // Increase max connections if needed
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
