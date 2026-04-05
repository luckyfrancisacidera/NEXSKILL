import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import LightLogo from "@shared/assets/Lightbrand_logo.png";
import BuildingImage from "@shared/assets/BuildingImage.jpg";

import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "@app/providers/AuthProvider";
import { AuthRouteTransition } from "@features/auth/components/AuthRouteTransition";
import { ApiError } from "@shared/api/http";
import { Button } from "@shared/components/actions/Button";
import { Checkbox } from "@shared/components/form/Checkbox";
import { runViewTransition } from "@shared/utils/viewTransition";
import { hasAnyAllowedRole } from "@shared/utils/permissions";

const RegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, startAppTransition } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openLogin = () => {
    runViewTransition(() => {
      navigate("/login", { state: { from: "/register" } });
    });
  };

  const legalRouteState = {
    from: location.pathname,
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();

    if (!normalizedFirstName) {
      setError("First name is required.");
      return;
    }

    if (!normalizedLastName) {
      setError("Last name is required.");
      return;
    }

    if (!agreedToTerms) {
      setError(
        "You must agree to the Terms of Service and Privacy Policy before creating an account.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const roles = await register({
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        email: email.trim(),
        password,
      });
      if (hasAnyAllowedRole(roles, ["jobseeker"])) {
        startAppTransition();
      }
      navigate(
        hasAnyAllowedRole(roles, ["jobseeker"]) ? "/dashboard" : "/login",
        { replace: true }
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const payload = error.data as { message?: string; errors?: string[] } | null;
        setError(payload?.errors?.[0] ?? payload?.message ?? "Unable to create account.");
        return;
      }

      setError("Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full bg-zinc-800 text-white font-inter md:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
      {/* Left panel */}
      <div className="hidden p-4 sm:p-8 md:block">
        <div
          className="bg-cover p-4 rounded-xl bg-center h-full w-full [-webkit-mask-image:linear-gradient(to_right,black_60%,transparent_100%)]"
          style={{ backgroundImage: `url(${BuildingImage})` }}
        >
          <div className="grid grid-rows-2 w-full h-full">
            <div className="w-full h-full">
              <img src={LightLogo} alt="LightLogo.png" className="w-15" />
            </div>

            <div className="flex w-full h-full p-12 items-end justify-center">
              <h2 className="text-5xl text-center font-bold tracking-widest leading-15">
                Hire Smarter. Match Faster.
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center bg-zinc-800 p-6 sm:p-8">
        <AuthRouteTransition className="w-full max-w-md">
          <div className="min-h-140">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Create an account
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                Enter your details to get started.
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 w-full">
                  <label
                    htmlFor="register-first-name"
                    className="block text-sm font-medium text-zinc-200"
                  >
                    First Name
                  </label>
                  <input
                    id="register-first-name"
                    type="text"
                    name="firstName"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-zinc-700 bg-zinc-800/50 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/40 transition-all"
                    placeholder="John"
                    autoComplete="given-name"
                    maxLength={120}
                    required
                  />
                </div>

                <div className="space-y-2 w-full">
                  <label
                    htmlFor="register-last-name"
                    className="block text-sm font-medium text-zinc-200"
                  >
                    Last Name
                  </label>
                  <input
                    id="register-last-name"
                    type="text"
                    name="lastName"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-zinc-700 bg-zinc-800/50 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/40 transition-all"
                    placeholder="Doe"
                    autoComplete="family-name"
                    maxLength={120}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="register-email"
                  className="block text-sm font-medium text-zinc-200"
                >
                  Email address
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-zinc-700 bg-zinc-800/50 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/40 transition-all"
                  placeholder="john@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="register-password"
                  className="block text-sm font-medium text-zinc-200"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-zinc-700 bg-zinc-800/50 px-4 pr-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/40 transition-all"
                    placeholder="Enter your password"
                    autoComplete="new-password"
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

              <Checkbox
                id="register-agree-terms"
                checked={agreedToTerms}
                onChange={(event) => setAgreedToTerms(event.target.checked)}
                required
                labelClickable={false}
                label={
                  <span>
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      state={legalRouteState}
                      className="font-medium text-white underline decoration-zinc-500 underline-offset-4 transition hover:text-zinc-200 hover:decoration-zinc-300"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      state={legalRouteState}
                      className="font-medium text-white underline decoration-zinc-500 underline-offset-4 transition hover:text-zinc-200 hover:decoration-zinc-300"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      Privacy Policy
                    </Link>
                  </span>
                }
              />

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex flex-col gap-4 w-full pt-1">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  loadingText="Creating account"
                  className="h-12 w-full rounded-2xl bg-white text-sm font-semibold text-zinc-900 hover:bg-zinc-200 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
                >
                  Create account
                </Button>

                <div className="flex items-center gap-4 py-1 w-full">
                  <div className="flex-1 bg-zinc-700 h-px"></div>
                  <p className="text-sm text-zinc-400">
                    Already have an account?
                  </p>
                  <div className="flex-1 bg-zinc-700 h-px"></div>
                </div>

                <button
                  type="button"
                  onClick={openLogin}
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-zinc-500 bg-transparent px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700/30 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-800"
                >
                  Sign in instead
                </button>
              </div>
            </form>
          </div>
        </AuthRouteTransition>
      </div>
    </div>
  );
};

export default RegisterPage;

