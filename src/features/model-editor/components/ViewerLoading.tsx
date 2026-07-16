import { LoaderCircle } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export function ViewerLoading() {
  const {t}=useTranslation();
  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <div className="text-center">
        <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-orange-400" />

        <p className="mt-4 text-sm font-medium text-white">
          {t("viewer.loadTitle")}
        </p>

        <p className="mt-1 text-sm text-neutral-500">
          {t("viewer.loadDescription")}
        </p>
      </div>
    </div>
  );
}
