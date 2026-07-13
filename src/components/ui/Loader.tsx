import { LoaderCircle } from "lucide-react";

type LoaderProps = {
  label?: string;
};

export function Loader({
  label = "Loading...",
}: LoaderProps) {
  return (
    <div className="flex items-center justify-center gap-3 text-sm text-neutral-400">
      <LoaderCircle className="h-5 w-5 animate-spin" />
      <span>{label}</span>
    </div>
  );
}