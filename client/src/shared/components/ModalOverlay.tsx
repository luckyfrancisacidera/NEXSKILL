import type { MouseEvent, PropsWithChildren } from "react";

interface ModalOverlayProps extends PropsWithChildren {
  onClose: () => void;
}

export const ModalOverlay = ({ onClose, children }: ModalOverlayProps) => (
  <div className="fixed inset-0 z-80 flex items-center justify-center p-4 font-inter">
    <button
      type="button"
      onClick={onClose}
      aria-label="Close modal"
      className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[3px]"
    />
    <div
      className="relative z-81 w-full max-w-lg"
      onClick={(event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
      }}
    >
      {children}
    </div>
  </div>
);
