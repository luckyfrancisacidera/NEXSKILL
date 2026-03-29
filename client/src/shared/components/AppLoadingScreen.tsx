import { AtsWakeLoaderSurface } from "@shared/components/AtsWakeLoaderSurface";

export const AppLoadingScreen = () => (
  <div className="pointer-events-auto fixed inset-0 z-[140]">
    <AtsWakeLoaderSurface fullPage />
  </div>
);
