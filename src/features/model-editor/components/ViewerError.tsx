import {
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

type ViewerErrorProps = {
  message?: string;
  onRetry?: () => void;
};

export function ViewerError({
  message,
  onRetry,
}: ViewerErrorProps) {
  const {t}=useTranslation();
  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-white">
          {t("viewer.errorTitle")}
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          {message??t("viewer.errorDescription")}
        </p>

        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.05]"
          >
            <RotateCcw className="h-4 w-4" />
            {t("common.retry")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
