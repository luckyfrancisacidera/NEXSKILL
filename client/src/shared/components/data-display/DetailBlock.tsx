import type { ReactNode } from "react";

export const DetailBlock = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
    <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">{children}</div>
  </div>
);
