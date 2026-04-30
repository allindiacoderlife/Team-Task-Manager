import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { OTPInput } from "input-otp";
import {
  Mail,
  Loader2,
  ArrowLeft,
  Stethoscope,
  KeyRound,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Wallpaper,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ForgetPassword = () => {
  // step: 'email' → 'otp' → 'reset' → 'success'
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Step 1: Send OTP to email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your email.",
      });
      setResendTimer(30);
      setStep("otp");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP → get reset token
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otpValue.length !== 6) return;

    setIsLoading(true);
    try {
      const response = await authService.verifyOtp(
        email,
        otpValue,
        "RESET_PASSWORD",
      );
      const token = response.token || response.data?.token;
      if (token) {
        setResetToken(token);
        toast({
          title: "OTP Verified",
          description: "Now set your new password.",
        });
        setStep("reset");
      } else {
        throw new Error("No reset token received");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description:
          error.response?.data?.message || "Invalid OTP. Please try again.",
      });
      setOtpValue("");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password with the token
  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken, password);
      toast({
        title: "Password Reset Successful",
        description: "You can now login with your new password.",
      });
      setStep("success");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description:
          error.response?.data?.message ||
          "Failed to reset password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    try {
      await authService.forgotPassword(email);
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your email.",
      });
      setResendTimer(30);
      setOtpValue("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Resend Failed",
        description: "Could not resend the code. Please try again.",
      });
    }
  };

  // ─── Step Content Renderers ─────────────────────────────

  const renderEmailStep = () => (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <KeyRound className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Forgot Password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a verification code.
        </p>
      </div>

      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email" className="font-medium text-foreground">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              required
              className="pl-10 py-6"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-6 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...
            </>
          ) : (
            "Send Verification Code"
          )}
        </Button>
      </form>
    </>
  );

  const renderOtpStep = () => (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Verify OTP
        </h1>
        <p className="text-sm text-muted-foreground w-full max-w-xs mx-auto">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <form onSubmit={handleOtpSubmit} className="flex flex-col gap-8 mt-2">
        <div className="flex justify-center">
          <OTPInput
            maxLength={6}
            value={otpValue}
            onChange={setOtpValue}
            containerClassName="flex gap-2"
            render={({ slots }) => (
              <>
                {slots.map((slot, idx) => (
                  <Slot key={idx} {...slot} />
                ))}
              </>
            )}
          />
        </div>

        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
            disabled={otpValue.length !== 6 || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...
              </span>
            ) : (
              "Verify Code"
            )}
          </Button>

          <div className="flex flex-col items-center gap-3 text-sm">
            <p className="text-muted-foreground">
              Didn't receive the code?{" "}
              <button
                type="button"
                className={`font-semibold ml-1 transition-colors ${
                  resendTimer > 0
                    ? "text-muted-foreground/70 cursor-not-allowed"
                    : "text-primary hover:underline hover:text-primary/80"
                }`}
                disabled={resendTimer > 0}
                onClick={handleResend}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
              </button>
            </p>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtpValue("");
              }}
              className="flex items-center text-muted-foreground hover:text-primary transition-colors font-medium hover:underline underline-offset-4 text-sm"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Change email
            </button>
          </div>
        </div>
      </form>
    </>
  );

  const renderResetStep = () => (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <KeyRound className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reset Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleResetSubmit} className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="password" className="font-medium text-foreground">
            New Password
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
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor="confirmPassword"
            className="font-medium text-foreground"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              className="pl-10 pr-10 py-6"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-6 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Password Reset!
        </h1>
        <p className="text-sm text-muted-foreground">
          Your password has been successfully reset. You can now sign in with
          your new password.
        </p>

        <Button
          className="w-full py-6 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 mt-4"
          onClick={() => navigate("/login")}
        >
          Back to Sign In
        </Button>
      </div>
    </>
  );

  // Step indicator
  const steps = ["email", "otp", "reset"];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Side: Image Section */}
      <div className="relative hidden w-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <img
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
          alt="Team Meeting"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />

        <div className="relative z-20 flex items-center text-lg font-medium gap-2">
          <Wallpaper className="h-6 w-6" />
          <span className="font-bold uppercase tracking-wider">Team Task Manager</span>
        </div>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-3xl font-semibold leading-tight">
              "Organize your team tasks and projects in one central workspace."
            </p>
            <footer className="text-sm font-medium tracking-wide text-white/80">
              TEAM TASK MANAGER
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side: Form Section */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-background dark:bg-background-dark">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm transition-all duration-300">
            <div className="flex flex-col gap-6">
              {/* Step Progress Indicator */}
              {step !== "success" && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  {steps.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2 w-8 rounded-full transition-all duration-300",
                          i <= currentStepIndex
                            ? "bg-primary"
                            : "bg-muted-foreground/20",
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Step Content */}
              {step === "email" && renderEmailStep()}
              {step === "otp" && renderOtpStep()}
              {step === "reset" && renderResetStep()}
              {step === "success" && renderSuccessStep()}

              {/* Back to Login Link */}
              {step !== "success" && (
                <div className="text-center">
                  <Link
                    to="/login"
                    className="flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to login
                  </Link>
                </div>
              )}

              <div className="text-center text-xs text-muted-foreground/60 mt-4">
                © {new Date().getFullYear()} Team Task Manager. All rights
                reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// OTP Slot Component
function Slot(props) {
  return (
    <div
      className={cn(
        "relative flex h-14 w-12 sm:h-16 sm:w-14 items-center justify-center rounded-xl border border-input bg-background font-bold text-xl shadow-sm transition-all outline-none",
        props.isActive &&
          "z-10 ring-2 ring-primary ring-offset-background border-primary",
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      )}
    </div>
  );
}

export default ForgetPassword;
