import ATSWakingLoader from "@shared/pages/ATSWakingLoader";

interface AtsWakeLoaderSurfaceProps {
  fullPage?: boolean;
}

export const AtsWakeLoaderSurface = ({
  fullPage = false,
}: AtsWakeLoaderSurfaceProps) => {
  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-800 via-zinc-800 to-zinc-900 px-4 py-8">
        <div className="w-full max-w-xl">
          <ATSWakingLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex justify-center">
      <div className="w-full max-w-2xl rounded-4xl border border-zinc-700/70 bg-linear-to-br from-zinc-800 via-zinc-800 to-zinc-900 p-3 shadow-[0_30px_70px_-36px_rgba(0,0,0,0.9)] sm:p-4">
        <ATSWakingLoader />
      </div>
    </div>
  );
};
