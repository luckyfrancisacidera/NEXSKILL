import { Funnel } from "lucide-react";
export default function Searchbar() {
  return (
    <div
      className="flex h-full w-full max-w-120 items-center rounded-xl border px-3"
    >
      <input
        className="w-full h-auto bg-primary-dark border-0"
        type="text"
        placeholder="Search candidate"
      />
      <Funnel></Funnel>
    </div>
  );
}
