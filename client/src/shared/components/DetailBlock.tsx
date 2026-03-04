import type { ReactNode } from "react";

export const DetailBlock = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
    <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
    <div className="mt-3 border-t border-zinc-200 pt-3">{children}</div>
  </div>
);