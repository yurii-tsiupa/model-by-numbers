import {
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

type ViewerErrorProps = {
  message?: string;
  onRetry?: () => void;
};

export function ViewerError({
  message = "The file may be damaged or use an unsupported format.",
  onRetry,
}: ViewerErrorProps) {
  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-white">
          We could not open this model
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          {message}
        </p>

        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.05]"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
        ) : null}
      </div>
    </div>
  );
}