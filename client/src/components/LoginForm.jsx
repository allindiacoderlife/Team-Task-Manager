import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  LogIn,
  Loader2,
  Wallpaper,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/use-toast";

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your email.",
      });
      navigate("/verify");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description:
          error.response?.data?.message ||
          "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Wallpaper className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Admin Portal
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage the Team Task Manager
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email" className="font-medium text-foreground">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              required
              className="pl-10 py-6"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password" className="font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              className="pl-10 pr-10 py-6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <Link
            to="/forget-password"
            className="ml-auto text-sm font-medium text-primary hover:text-primary/80"
          >
            Forgot password?
          </Link>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary block mb-0.5">
              Two-Factor Authentication Enabled
            </span>
            For security, you will be asked to verify your identity via email
            OTP after signing in.
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-6 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing In...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-5 w-5" /> Sign In
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Sign Up
        </Link>
      </div>

      <div className="text-center text-xs text-muted-foreground/60 mt-4">
        © {new Date().getFullYear()} Team Task Manager. All rights
        reserved.
      </div>
    </div>
  );
}
