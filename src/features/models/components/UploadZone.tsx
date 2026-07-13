"use client";

import {
  CheckCircle2,
  FileBox,
  UploadCloud,
  X,
} from "lucide-react";
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import {
  ACCEPTED_MODEL_EXTENSIONS,
  MAX_MODEL_FILE_SIZE,
} from "../constants/project.constants";

type UploadZoneProps = {
  file: File | null;
  disabled?: boolean;
  error?: string | null;
  onFileChange: (file: File | null) => void;
};

function formatFileSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024);

  if (megabytes >= 1) {
    return `${megabytes.toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function validateFile(file: File): string | null {
  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

  if (
    !ACCEPTED_MODEL_EXTENSIONS.includes(
      extension as (typeof ACCEPTED_MODEL_EXTENSIONS)[number],
    )
  ) {
    return "Only .glb files are currently supported.";
  }

  if (file.size === 0) {
    return "The selected file is empty.";
  }

  if (file.size > MAX_MODEL_FILE_SIZE) {
    return "The model file must not exceed 50 MB.";
  }

  return null;
}

export function UploadZone({
  file,
  disabled = false,
  error,
  onFileChange,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function selectFile(selectedFile: File) {
    const validationError = validateFile(selectedFile);

    if (validationError) {
      setLocalError(validationError);
      onFileChange(null);
      return;
    }

    setLocalError(null);
    onFileChange(selectedFile);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      selectFile(selectedFile);
    }

    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!disabled) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const selectedFile = event.dataTransfer.files?.[0];

    if (selectedFile) {
      selectFile(selectedFile);
    }
  }

  function handleRemoveFile() {
    if (disabled) {
      return;
    }

    setLocalError(null);
    onFileChange(null);
  }

  const visibleError = localError ?? error;

  if (file) {
    return (
      <div>
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
            <FileBox className="h-5 w-5 text-emerald-400" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-white">
                {file.name}
              </p>

              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            </div>

            <p className="mt-1 text-xs text-neutral-500">
              {formatFileSize(file.size)} · Ready to create
            </p>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={handleRemoveFile}
            aria-label="Remove selected file"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 text-neutral-500 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {visibleError ? (
          <p className="mt-2 text-sm text-red-400">{visibleError}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".glb,model/gltf-binary,application/octet-stream"
        disabled={disabled}
        onChange={handleInputChange}
        className="hidden"
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) {
            inputRef.current?.click();
          }
        }}
        onKeyDown={(event) => {
          if (
            !disabled &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "rounded-2xl border border-dashed px-6 py-10 text-center transition",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer",
          isDragging
            ? "border-orange-400/60 bg-orange-400/[0.08]"
            : "border-white/15 bg-white/[0.025] hover:border-white/25 hover:bg-white/[0.04]",
        ].join(" ")}
      >
        <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
          <UploadCloud className="h-6 w-6 text-orange-400" />
        </div>

        <p className="mt-4 text-sm font-medium text-white">
          Drop your model here
        </p>

        <p className="mt-1 text-sm text-neutral-500">
          or click to browse files
        </p>

        <p className="mt-4 text-xs text-neutral-600">
          GLB only · Maximum 50 MB
        </p>
      </div>

      {visibleError ? (
        <p className="mt-2 text-sm text-red-400">{visibleError}</p>
      ) : null}
    </div>
  );
}