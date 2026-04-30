import nodemailer from "nodemailer";
import { config } from "../config/app.config.js";

export const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: Number(config.smtp.port),
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
  tls: {
    rejectUnauthorized: false, // For development, accept self-signed certificates
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
    console.log("📧 SMTP Config:", {
      host: config.smtp.host,
      port: config.smtp.port,
      user: config.smtp.user,
    });
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

export function otpEmailTemplate(otp) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>OTP Verification</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
      <tr>
        <td align="center">
          <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:30px;">
            
            <tr>
              <td align="center" style="font-size:22px; font-weight:bold; color:#333;">
                🔐 OTP Verification
              </td>
            </tr>

            <tr>
              <td style="padding:20px 0; font-size:14px; color:#555;">
                Hi there,
                <br /><br />
                Use the following One-Time Password (OTP) to complete your verification process.
                This OTP is valid for <strong>5 minutes</strong>.
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:20px 0;">
                <div style="
                  display:inline-block;
                  font-size:28px;
                  letter-spacing:6px;
                  font-weight:bold;
                  color:#ffffff;
                  background:#4f46e5;
                  padding:12px 24px;
                  border-radius:6px;">
                  ${otp}
                </div>
              </td>
            </tr>

            <tr>
              <td style="font-size:13px; color:#888; padding-top:20px;">
                If you did not request this OTP, you can safely ignore this email.
              </td>
            </tr>

            <tr>
              <td style="padding-top:30px; font-size:12px; color:#aaa;" align="center">
                © ${new Date().getFullYear()} Team-Task-Manager
                <br />
                All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
