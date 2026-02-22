/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PropsWithChildren, ReactNode } from 'react';

export const ResponsiveContainer = ({ children }: PropsWithChildren<{ width?: string; height?: string }>) => (
  <div className="h-full w-full">{children}</div>
);

export const BarChart = ({ data, children }: PropsWithChildren<{ data: Array<Record<string, string | number>> }>) => {
  const max = Math.max(...data.map((item) => Number(item.applications ?? 0)), 1);
  return (
    <div className="flex h-full w-full flex-col">
      <div className="mt-auto flex h-full items-end gap-3 px-2">
        {data.map((item) => (
          <div key={String(item.day)} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-md bg-zinc-900" style={{ height: `${(Number(item.applications) / max) * 100}%` }} />
            <span className="text-xs text-zinc-500">{item.day as ReactNode}</span>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
};

export const Bar = (_props: Record<string, unknown>) => null;
export const CartesianGrid = (_props: Record<string, unknown>) => null;
export const XAxis = (_props: Record<string, unknown>) => null;
export const YAxis = (_props: Record<string, unknown>) => null;
export const Tooltip = (_props: Record<string, unknown>) => null;
