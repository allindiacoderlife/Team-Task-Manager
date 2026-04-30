import api from "../lib/api";

export const authService = {
  register: async (name, email, password) => {
    const response = await api.post("/auth/register", { name, email, password });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  sendOtp: async (email, type = "LOGIN", token) => {
    const response = await api.post(
      "/auth/send-otp",
      { email, type },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },
  verifyOtp: async (email, code, type = "LOGIN") => {
    const response = await api.post("/auth/verify-otp", { email, code, type });
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },
  resetPassword: async (email, code, newPassword) => {
    const response = await api.post("/auth/reset-password", {
      email,
      code,
      newPassword,
    });
    return response.data;
  },
};