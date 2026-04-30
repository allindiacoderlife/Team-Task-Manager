import { AuthService } from "./auth.service.js";

const authService = new AuthService();

export class AuthController {
  async register(req, res) {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    return res.status(201).json(result);
  }

  async login(req, res) {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return res.status(200).json(result);
  }

  async sendEmailOtp(req, res) {
    const { email, type } = req.body;
    const result = await authService.sendEmailOtp(email, type);
    return res.status(200).json(result);
  }

  async verifyOtpAndLogin(req, res) {
    const { email, code } = req.body;
    const result = await authService.verifyOtpAndLogin({ email, code });
    return res.status(200).json(result);
  }

  async forgotPassword(req, res) {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    return res.status(200).json(result);
  }

  async resetPassword(req, res) {
    const { email, code, newPassword } = req.body;
    const result = await authService.resetPassword({
      email,
      code,
      newPassword,
    });
    return res.status(200).json(result);
  }
}
