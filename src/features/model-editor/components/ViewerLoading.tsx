import { LoaderCircle } from "lucide-react";

export function ViewerLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <div className="text-center">
        <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-orange-400" />

        <p className="mt-4 text-sm font-medium text-white">
          Loading 3D model
        </p>

        <p className="mt-1 text-sm text-neutral-500">
          Preparing geometry and materials...
        </p>
      </div>
    </div>
  );
}