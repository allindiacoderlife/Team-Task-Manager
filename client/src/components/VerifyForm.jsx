import { Button } from "@/components/ui/button";
import { OTPInput } from "input-otp";
import { ShieldCheck, ArrowLeft, Loader2, Wallpaper } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function VerifyForm({ className, ...props }) {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const { verifyOtp, pendingEmail, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If there's no pending email, redirect back to login
    if (!pendingEmail) {
      navigate("/login", { replace: true });
    }
  }, [pendingEmail, navigate]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (value.length !== 6) return;

    setIsLoading(true);
    try {
      await verifyOtp(value);
      toast({
        title: "Verification Successful",
        description: "Welcome to Team Task Manager.",
      });
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description:
          error.response?.data?.message || "Invalid OTP. Please try again.",
      });
      setValue("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      // Re-trigger login to resend OTP (the backend sends a new OTP on login)
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      });
      setResendTimer(30);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Resend Failed",
        description: "Could not resend the code. Please try again.",
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Wallpaper className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Verify your identity
        </h1>
        <p className="text-sm text-muted-foreground w-full max-w-xs mx-auto">
          Enter the 6-digit code sent to{" "}
          {pendingEmail ? (
            <span className="font-medium text-foreground">{pendingEmail}</span>
          ) : (
            "your registered email address"
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 mt-4">
        <div className="flex justify-center">
          <OTPInput
            maxLength={6}
            value={value}
            onChange={setValue}
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
            className="w-full py-6 text-base font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xl transition-all"
            disabled={value.length !== 6 || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...
              </span>
            ) : (
              "Verify & Sign In"
            )}
          </Button>

          <div className="flex flex-col items-center gap-4 text-sm">
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

            <Link
              to="/login"
              className="flex items-center text-muted-foreground hover:text-primary transition-colors font-medium hover:underline underline-offset-4"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to login
            </Link>
          </div>
        </div>
      </form>

      <div className="text-center text-xs text-muted-foreground mt-2">
        Your account is protected by multi-factor authentication.
        <div className="mt-4 text-muted-foreground/60">
          © {new Date().getFullYear()} Team Task Manager. All rights
          reserved.
        </div>
      </div>
    </div>
  );
}

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
