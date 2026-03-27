import { useEffect, type MouseEvent, type PropsWithChildren } from "react";

interface ModalOverlayProps extends PropsWithChildren {
  onClose: () => void;
  containerClassName?: string;
}

export const ModalOverlay = ({ onClose, children, containerClassName = "max-w-lg" }: ModalOverlayProps) => {
  useEffect(() => {
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4 font-inter">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[3px]"
      />
      <div
        className={`relative z-81 w-full ${containerClassName}`}
        onClick={(event: MouseEvent<HTMLDivElement>) => {
          event.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
};
