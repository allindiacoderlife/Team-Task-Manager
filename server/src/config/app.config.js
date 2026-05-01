export const config = {
  //! ─── App Configuration ────────────────────────────────
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || "development",
  appUrl: process.env.CLIENT_URL || "http://localhost:5173",

  //! ─── Database Configuration ───────────────────────────
  databaseUrl: process.env.DATABASE_URL,

  //! ─── Security Configuration ───────────────────────────
  security: {
    saltRounds: Number(process.env.SALT_ROUNDS) || 12,
    jwtSecret: process.env.JWT_SECRET || "",
  },

  //! ─── SMTP Configuration ────────────────────────────────
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
};
