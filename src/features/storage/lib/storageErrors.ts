export class StorageUnavailableError extends Error { override name = "StorageUnavailableError"; }
export class StorageQuotaExceededError extends Error { override name = "StorageQuotaExceededError"; }
export class StorageReadError extends Error { override name = "StorageReadError"; }
export class StorageWriteError extends Error { override name = "StorageWriteError"; }
export class StorageDeleteError extends Error { override name = "StorageDeleteError"; }

export function storageError(operation: "read" | "write" | "delete", cause?: unknown): Error {
  if (cause instanceof DOMException && (cause.name === "QuotaExceededError" || cause.name === "NS_ERROR_DOM_QUOTA_REACHED"))
    return new StorageQuotaExceededError("There is not enough browser storage to save this file.", { cause });
  const message = operation === "read" ? "We could not read this local file." : operation === "write" ? "We could not save this local file." : "We could not delete this local file.";
  const Type = operation === "read" ? StorageReadError : operation === "write" ? StorageWriteError : StorageDeleteError;
  return new Type(message, { cause });
}
