"use client";

import {
  LoaderCircle,
  Plus,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  DEFAULT_PROJECT_COLOR,
  MATERIAL_OPTIONS,
  PRINTER_TYPE_OPTIONS,
} from "../constants/project.constants";
import { useCreateProject } from "../hooks/useCreateProject";
import type {
  PrinterType,
  ProjectMaterial,
} from "../types/Project";
import { UploadZone } from "./UploadZone";

type NewProjectModalProps = {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
};

type FormErrors = {
  name?: string;
  file?: string;
  submit?: string;
};

const INITIAL_PRINTER_TYPE: PrinterType = "fdm";
const INITIAL_MATERIAL: ProjectMaterial = "pla";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to create the project. Please try again.";
}

export function NewProjectModal({
  userId,
  isOpen,
  onClose,
}: NewProjectModalProps) {
  const createProjectMutation = useCreateProject(userId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [printerType, setPrinterType] =
    useState<PrinterType>(INITIAL_PRINTER_TYPE);
  const [material, setMaterial] =
    useState<ProjectMaterial>(INITIAL_MATERIAL);
  const [baseColor, setBaseColor] = useState(
    DEFAULT_PROJECT_COLOR,
  );
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});

  const isSubmitting = createProjectMutation.isPending;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isSubmitting, onClose]);

  function resetForm() {
    setName("");
    setDescription("");
    setPrinterType(INITIAL_PRINTER_TYPE);
    setMaterial(INITIAL_MATERIAL);
    setBaseColor(DEFAULT_PROJECT_COLOR);
    setFile(null);
    setUploadProgress(0);
    setErrors({});
    createProjectMutation.reset();
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  }

  function validateForm(): boolean {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Project name is required.";
    } else if (name.trim().length > 80) {
      nextErrors.name =
        "Project name must not exceed 80 characters.";
    }

    if (!file) {
      nextErrors.file = "Select a GLB model file.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm() || !file) {
      return;
    }

    try {
      setErrors({});
      setUploadProgress(0);

      await createProjectMutation.mutateAsync({
        userId,
        name,
        description,
        printerType,
        material,
        baseColor,
        file,
        onUploadProgress: setUploadProgress,
      });

      resetForm();
      onClose();
    } catch (error) {
      setErrors({
        submit: getErrorMessage(error),
      });
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] border border-white/10 bg-neutral-950 shadow-2xl shadow-black/70 sm:rounded-[2rem]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-neutral-950/95 px-6 py-5 backdrop-blur-xl sm:px-8">
          <div>
            <p className="text-sm font-medium text-orange-400">
              New project
            </p>

            <h2
              id="new-project-title"
              className="mt-1 text-2xl font-semibold tracking-tight text-white"
            >
              Add a 3D model
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Add the project details and select a GLB model file.
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            aria-label="Close modal"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 text-neutral-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-6 py-6 sm:px-8">
            <div>
              <label
                htmlFor="project-name"
                className="text-sm font-medium text-neutral-200"
              >
                Project name
              </label>

              <input
                id="project-name"
                type="text"
                value={name}
                disabled={isSubmitting}
                maxLength={80}
                placeholder="For example: Space Marine"
                onChange={(event) => {
                  setName(event.target.value);

                  if (errors.name) {
                    setErrors((current) => ({
                      ...current,
                      name: undefined,
                    }));
                  }
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-orange-400/50 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mt-2 flex justify-between gap-4">
                {errors.name ? (
                  <p className="text-sm text-red-400">
                    {errors.name}
                  </p>
                ) : (
                  <span />
                )}

                <span className="shrink-0 text-xs text-neutral-600">
                  {name.length}/80
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="project-description"
                className="text-sm font-medium text-neutral-200"
              >
                Description
              </label>

              <textarea
                id="project-description"
                value={description}
                disabled={isSubmitting}
                maxLength={500}
                rows={4}
                placeholder="A short description of your model..."
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-neutral-600 focus:border-orange-400/50 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-right text-xs text-neutral-600">
                {description.length}/500
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="printer-type"
                  className="text-sm font-medium text-neutral-200"
                >
                  Printer type
                </label>

                <select
                  id="printer-type"
                  value={printerType}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setPrinterType(
                      event.target.value as PrinterType,
                    )
                  }
                  className="mt-2 w-full cursor-pointer rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {PRINTER_TYPE_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="project-material"
                  className="text-sm font-medium text-neutral-200"
                >
                  Material
                </label>

                <select
                  id="project-material"
                  value={material}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setMaterial(
                      event.target.value as ProjectMaterial,
                    )
                  }
                  className="mt-2 w-full cursor-pointer rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {MATERIAL_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="base-color"
                className="text-sm font-medium text-neutral-200"
              >
                Base color
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <input
                  id="base-color"
                  type="color"
                  value={baseColor}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setBaseColor(event.target.value)
                  }
                  className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0 disabled:cursor-not-allowed"
                />

                <div
                  className="h-9 w-9 rounded-full border border-white/15"
                  style={{ backgroundColor: baseColor }}
                />

                <input
                  type="text"
                  value={baseColor}
                  disabled={isSubmitting}
                  maxLength={7}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (/^#[0-9a-fA-F]{0,6}$/.test(value)) {
                      setBaseColor(value);
                    }
                  }}
                  className="min-w-0 flex-1 bg-transparent text-sm uppercase text-white outline-none disabled:cursor-not-allowed"
                  aria-label="Base color hexadecimal value"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-200">
                Model file
              </p>

              <UploadZone
                file={file}
                disabled={isSubmitting}
                error={errors.file}
                onFileChange={(selectedFile) => {
                  setFile(selectedFile);

                  if (errors.file) {
                    setErrors((current) => ({
                      ...current,
                      file: undefined,
                    }));
                  }
                }}
              />
            </div>

            {isSubmitting ? (
              <div className="rounded-2xl border border-orange-400/15 bg-orange-400/[0.05] p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="flex items-center gap-2 text-neutral-300">
                    <LoaderCircle className="h-4 w-4 animate-spin text-orange-400" />
                    Preparing project...
                  </span>

                  <span className="font-medium text-orange-400">
                    {uploadProgress}%
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-[width] duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-neutral-500">
                  The model is currently handled locally. Only its
                  project metadata will be saved.
                </p>
              </div>
            ) : null}

            {errors.submit ? (
              <p
                role="alert"
                className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-400"
              >
                {errors.submit}
              </p>
            ) : null}
          </div>

          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/10 bg-neutral-950/95 px-6 py-5 backdrop-blur-xl sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="cursor-pointer rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}