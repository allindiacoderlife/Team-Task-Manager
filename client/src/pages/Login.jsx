import { LoginForm } from "../components/LoginForm";
import { Wallpaper } from "lucide-react";

const Login = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Side: Image Section */}
      <div className="relative hidden w-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />

        <div className="relative z-20 flex items-center text-lg font-medium gap-2">
          <Wallpaper className="h-6 w-6" />
          <span className="font-bold">Team Task Manager</span>
        </div>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-3xl font-semibold leading-tight">
              "Manage your team tasks and projects with ease."
            </p>
            <footer className="text-sm font-medium tracking-wide text-white/80">
              Team Task Manager
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side: Form Section */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-background dark:bg-background-dark">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm transition-all duration-300">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
