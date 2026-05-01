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

  //! ─── Email Configuration (Resend) ─────────────────────
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "Team Task Manager <onboarding@resend.dev>",
};
