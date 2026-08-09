type GuideStorageKeyRecord = {
  id?: unknown;
  projectId?: unknown;
  version?: unknown;
  status?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  snapshot?: unknown;
};

const isValidDate = (value: unknown): value is Date => value instanceof Date && !Number.isNaN(value.getTime());
const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

export function applyGuideStorageKeys<T extends object>(input: T, keys: { id: string; version: number; createdAt: Date; updatedAt: Date }): T & typeof keys {
  return { ...input, ...keys };
}

export function validateGuideStorageRecord(record: GuideStorageKeyRecord): void {
  const operation = record.status === "draft" ? "draft" : "guide";
  if (!isNonEmptyString(record.id)) throw new Error(`Cannot save ${operation}: missing id`);
  if (!isNonEmptyString(record.projectId)) throw new Error(`Cannot save ${operation}: missing projectId`);
  if (!Number.isSafeInteger(record.version) || Number(record.version) < 1) throw new Error(`Cannot save ${operation}: invalid version`);
  if (record.status !== "draft" && record.status !== "ready") throw new Error("Cannot save guide: invalid status");
  if (!isValidDate(record.createdAt)) throw new Error(`Cannot save ${operation}: invalid createdAt`);
  if (!isValidDate(record.updatedAt)) throw new Error(`Cannot save ${operation}: invalid updatedAt`);
  if (!record.snapshot || typeof record.snapshot !== "object") throw new Error(`Cannot save ${operation}: missing snapshot`);
}
