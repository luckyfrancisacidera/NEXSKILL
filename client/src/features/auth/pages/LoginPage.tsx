import { useState } from "react";
import { useNavigate } from "react-router-dom";

import LightLogo from "@shared/assets/Lightbrand_logo.png";
import BuildingImage from "@shared/assets/BuildingImage.jpg";

import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "@app/providers/AuthProvider";
import { getDefaultRouteByRole } from "@app/routes/routes.guard";
import { AuthRouteTransition } from "@features/auth/components/AuthRouteTransition";
import { ResetPasswordPinModal } from "@features/auth/components/ResetPasswordPinModal";
import { ApiError } from "@shared/api/http";
import { Button } from "@shared/components/Button";
import { Checkbox } from "@shared/components/Checkbox";
import { runViewTransition } from "@shared/utils/viewTransition";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, startAppTransition } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  const openRegister = () => {
    runViewTransition(() => {
      navigate("/register", { state: { from: "/login" } });
    });
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const userRoles = await login(email.trim(), password, rememberMe);
      startAppTransition();
      navigate(getDefaultRouteByRole(userRoles), { replace: true });
    } catch (error) {
      setPassword("");

      if (error instanceof ApiError) {
        const payload = error.data as {
          message?: string;
          errors?: string[];
        } | null;
        setError(
          payload?.errors?.[0] ??
            payload?.message ??
            "Invalid email or password.",
        );
        return;
      }

      setError("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full bg-zinc-800 font-inter text-white md:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
      {/* Left panel */}
      <div className="hidden p-4 sm:p-8 md:block">
        <div
          className="bg-cover p-4 rounded-xl bg-center h-full w-full [-webkit-mask-image:linear-gradient(to_right,black_60%,transparent_100%)]"
          style={{ backgroundImage: `url(${BuildingImage})` }}
        >
          <div className="grid grid-rows-[30%_70%] w-full h-full">
            <div className="w-full h-full">
              <img src={LightLogo} alt="LightLogo.png" className="w-15" />
            </div>

            <div className="flex w-full h-full items-start justify-start flex-col gap-5 p-7">
              <h2 className="text-5xl text-center font-extrabold tracking-widest leading-15">
                Welcome back!
              </h2>
              <p className="text-sm tracking-wider">
                You can sign in to access with your existing account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="scrollbar-thin-stable flex min-h-screen items-center justify-center overflow-y-auto bg-zinc-800 p-6 sm:p-8">
        <AuthRouteTransition className="w-full max-w-md">
          <div className="py-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-wider text-white">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                Let's get you back to work
              </p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-zinc-200"
                >
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-zinc-700 bg-zinc-800/50 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/40 transition-all"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-zinc-200"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-zinc-700 bg-zinc-800/50 px-4 pr-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/40 transition-all"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex items-center justify-between gap-4 text-sm">
                <Checkbox
                  id="login-remember-me"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  label="Remember me"
                />

                <button
                  type="button"
                  className="text-sm font-medium text-zinc-200 transition-colors hover:text-white"
                  onClick={() => setIsResetPasswordModalOpen(true)}
                >
                  Forgot password?
                </button>
              </div>

              <div className="flex flex-col gap-4 w-full pt-1">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  loadingText="Signing in"
                  className="h-12 w-full rounded-2xl bg-white text-sm font-semibold text-zinc-900 hover:bg-zinc-200 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
                >
                  Sign in
                </Button>

                <div className="flex items-center gap-4 py-1 w-full">
                  <div className="flex-1 bg-zinc-700 h-px"></div>
                  <p className="text-sm text-zinc-400">
                    Don&apos;t have an account?
                  </p>
                  <div className="flex-1 bg-zinc-700 h-px"></div>
                </div>

                <button
                  type="button"
                  onClick={openRegister}
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-zinc-500 bg-transparent px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700/30 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-800"
                >
                  Create an account
                </button>
              </div>
            </form>
          </div>
        </AuthRouteTransition>
      </div>

      <ResetPasswordPinModal
        open={isResetPasswordModalOpen}
        initialEmail={email}
        onClose={() => setIsResetPasswordModalOpen(false)}
      />
    </div>
  );
};

export default LoginPage;
