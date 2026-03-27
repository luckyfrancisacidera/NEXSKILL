import { twMerge } from "tailwind-merge";

export const cn = (...values: Array<string | undefined | false | null>) =>
  twMerge(values.filter(Boolean).join(" "));
