import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth.service";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  // Pending email for OTP verification flow
  const [pendingEmail, setPendingEmail] = useState(
    sessionStorage.getItem("pendingEmail") || null,
  );

  useEffect(() => {
    // If a token exists, consider the user authenticated
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  }, [token]);

  // Step 1: Admin login (email + password) → verify credentials → send OTP
  const login = async (email, password) => {
    // 1. Verify credentials — server returns a short-lived token
    const response = await authService.login(email, password);
    const tempToken = response.token || response.data?.token;

    // 2. Store email + temp token so the OTP step can use them
    setPendingEmail(email);
    sessionStorage.setItem("pendingEmail", email);
    if (tempToken) {
      sessionStorage.setItem("pendingToken", tempToken);
    }

    // 3. Send OTP email — requires the bearer token from step 1
    await authService.sendOtp(email, "LOGIN", tempToken);

    return response;
  };

  // Step 2: Verify OTP → receive token
  const verifyOtp = async (otp, type = "LOGIN") => {
    const email = pendingEmail;
    if (!email) throw new Error("No pending email for verification");

    const response = await authService.verifyOtp(email, otp, type);

    const receivedToken = response.token || response.data?.token;

    // Only persist token and set authenticated for LOGIN flow
    if (type === "LOGIN" && receivedToken) {
      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);
      setIsAuthenticated(true);

      // Build and persist user info
      const userInfo = {
        email: email,
        role: response.role || response.data?.role || "ADMIN",
        ...(response.user || response.data?.user || {}),
      };
      setUser(userInfo);
      localStorage.setItem("user", JSON.stringify(userInfo));

      // Clear pending email
      setPendingEmail(null);
      sessionStorage.removeItem("pendingEmail");
    }

    return response;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("pendingEmail");
    sessionStorage.removeItem("pendingToken");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setPendingEmail(null);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    pendingEmail,
    login,
    verifyOtp,
    logout,
    setPendingEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
