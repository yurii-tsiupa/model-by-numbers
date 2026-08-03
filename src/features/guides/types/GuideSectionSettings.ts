export type GuideManageableSectionId =
  | "kit"
  | "assembly"
  | "finishing"
  | "troubleshooting"
  | "backCover";

export type GuideSectionPreference = {
  enabled: boolean;
};

export type GuideSectionSettings = Partial<
  Record<GuideManageableSectionId, GuideSectionPreference>
>;

const MANAGEABLE_SECTION_IDS: readonly GuideManageableSectionId[] = [
  "kit",
  "assembly",
  "finishing",
  "troubleshooting",
  "backCover",
];

export function normalizeGuideSectionSettings(value: unknown): GuideSectionSettings | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const settings: GuideSectionSettings = {};
  for (const id of MANAGEABLE_SECTION_IDS) {
    const preference = record[id];
    if (!preference || typeof preference !== "object") continue;
    const enabled = (preference as Record<string, unknown>).enabled;
    if (typeof enabled === "boolean") settings[id] = { enabled };
  }
  return Object.keys(settings).length ? settings : undefined;
}
