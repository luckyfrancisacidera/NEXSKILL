import { useState } from "react";
import { useNavigate } from "react-router-dom";

import LightLogo from "@shared/assets/Lightbrand_logo.png";
import BuildingImage from "@shared/assets/BuildingImage.jpg";
import GoogleLogo from "@shared/assets/GoogleLogo.svg";
import AppleLogo from "@shared/assets/AppleLogo.svg";

import { useAuth } from "@app/providers/AuthProvider";
import { getDefaultRouteByRole } from "@app/routes/routes.guard";
import { ApiError } from "@shared/api/http";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const userRoles = await login(email, password);
      navigate(getDefaultRouteByRole(userRoles), { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        const payload = error.data as { message?: string; errors?: string[] } | null;
        setError(payload?.errors?.[0] ?? payload?.message ?? 'Invalid email or password.');
        return;
      }

      setError('Invalid email or password.');
    }
  };

  return (
    <div className="grid grid-cols-[60%_40%] bg-zinc-800 w-full h-screen text-white font-inter">
      {/* Left panel */}
      <div className="p-8">
        <div
          className="bg-cover p-4 rounded-xl bg-center h-full w-full [-webkit-mask-image:linear-gradient(to_right,black_60%,transparent_100%)]"
          style={{ backgroundImage: `url(${BuildingImage})` }}
        >
          <div className="grid grid-rows-[30%_70%] w-full h-full">
            <div className="w-full h-full">
              <img src={LightLogo} alt="LightLogo.png" className="w-15" />
            </div>

            <div className="flex w-full h-full  items-start justify-start flex-col gap-5 p-7">
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
      <div className="flex justify-center font-inter items-center bg-zinc-800 p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-wider text-white">
              Sign in
            </h1>
            <p className="text-sm text-zinc-400 mt-2">
              Enter your credentials to access your account.
            </p>
          </div>

          <form action="" className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg w-full h-11 px-4 text-zinc-200 text-sm font-light placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                placeholder="Email Address"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg w-full h-11 px-4 text-zinc-200 text-sm font-light placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                placeholder="Password"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex flex-col gap-4 w-full mt-4">
              <button className="w-full h-11 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800">
                Sign in
              </button>

              <span className="text-[0.8em] text-zinc-300">
                Dont have an account?{" "}
                <a
                  href="/register"
                  className=" hover:text-zinc-300 text-zinc-400"
                >
                  Create an account
                </a>
              </span>

              <div className="flex items-center gap-4 my-2 w-full">
                <div className="flex-1 bg-zinc-700 h-px"></div>
                <p className="text-xs text-zinc-500 tracking-wider font-medium uppercase">
                  Or sign in with
                </p>
                <div className="flex-1 bg-zinc-700 h-px"></div>
              </div>

              {/* Alternative Login through social medias */}
              <div className="grid grid-cols-2 w-full gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 w-full h-11 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg border border-zinc-700 text-zinc-300 transition-colors"
                >
                  <span>
                    <img src={GoogleLogo} className="w-4" alt="" />
                  </span>
                  Gmail
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 w-full h-11 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg border border-zinc-700 text-zinc-300 transition-colors"
                >
                  <span>
                    <img src={AppleLogo} className="w-4" alt="" />
                  </span>
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

export default LoginPage;
