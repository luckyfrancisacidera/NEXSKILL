import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import LightLogo from "@shared/assets/Lightbrand_logo.png";
import BuildingImage from "@shared/assets/BuildingImage.jpg";
import GoogleLogo from "@shared/assets/GoogleLogo.svg";
import AppleLogo from "@shared/assets/AppleLogo.svg";

import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "@app/providers/AuthProvider";
import { ApiError } from "@shared/api/http";
import { hasAnyAllowedRole } from "@shared/utils/permissions";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");

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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const roles = await register({
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        email: email.trim(),
        password,
      });
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
              <img src={LightLogo} alt="LightLogo.png" className="w-[3.75rem]" />
            </div>

            <div className="flex w-full h-full p-12 items-end justify-center">
              <h2 className="text-5xl text-center font-bold tracking-widest leading-[3.75rem]">
                Hire Smarter. Match Faster.
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center bg-zinc-800 p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Create an account
            </h1>
            <p className="text-sm text-zinc-400 mt-2">
              Enter your details to get started.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {/* Name fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="w-full">
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-lg w-full h-11 px-4 text-zinc-200 text-sm font-light placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                  placeholder="First Name"
                  autoComplete="given-name"
                  maxLength={120}
                  required
                />
              </div>

              <div className="w-full">
                <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-lg w-full h-11 px-4 text-zinc-200 text-sm font-light placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                  placeholder="Last Name"
                  autoComplete="family-name"
                  maxLength={120}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg w-full h-11 px-4 text-zinc-200 text-sm font-light placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                placeholder="Email Address"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg w-full h-11 px-4 pr-10 text-zinc-200 text-sm font-light placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                placeholder="Password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg w-full h-11 px-4 pr-10 text-zinc-200 text-sm font-light placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                placeholder="Confirm Password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            {/* Buttons */}
            <div className="flex flex-col gap-4 w-full mt-4">
              <button className="w-full h-11 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800">
                Create account
              </button>

              <span className="text-[0.8em] text-zinc-300">
                Already have an account?{" "}
                <Link to="/login" className="hover:text-zinc-300 text-zinc-400">
                  Sign in.
                </Link>
              </span>

              {/* Divider */}
              <div className="flex items-center gap-4 my-2 w-full">
                <div className="flex-1 bg-zinc-700 h-px"></div>
                <p className="text-xs text-zinc-500 tracking-wider font-medium uppercase">
                  Or register with
                </p>
                <div className="flex-1 bg-zinc-700 h-px"></div>
              </div>

              {/* Social Login */}
              <div className="grid w-full gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 w-full h-11 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg border border-zinc-700 text-zinc-300 transition-colors"
                >
                  <img src={GoogleLogo} className="w-4" alt="" />
                  Google
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center gap-2 w-full h-11 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg border border-zinc-700 text-zinc-300 transition-colors"
                >
                  <img src={AppleLogo} className="w-4" alt="" />
                  Apple
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
