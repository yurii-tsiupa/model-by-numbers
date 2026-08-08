import type { GuidePageFormat } from "@/features/guides/types/GuidePageFormat";
import type { GuideBrandSettings } from "@/features/guides/types/GuideBrandSettings";
import type { GuidePdfBackgroundItems } from "@/features/guides/types/GuidePdfBackground";

export type GuideTemplateCategory = "minimal" | "technical" | "editorial" | "custom";
export type PageNumberStyle = "numeric" | "numericWithTotal";
export type PageNumberPosition = "bottomLeft" | "bottomCenter" | "bottomRight";

import type { GuideFontId } from "@/features/guides/design/guideFontRegistry";

export type GuideTemplateSettings = {
  branding: GuideBrandSettings;
  backgroundItems: GuidePdfBackgroundItems;
  pageFormat: GuidePageFormat;
  pageBackground: string;
  textColor: string;
  accentColor: string;
  headingFont: GuideFontId;
  bodyFont: GuideFontId;
  monoFont: GuideFontId;
  pageNumberStyle: PageNumberStyle;
  pageNumberPosition: PageNumberPosition;
  dividerStyle: "none" | "line" | "accent";
  coverStyle: "minimal" | "solid";
  spacing: "compact" | "comfortable";
};

type TemplateBase = { id: string; category: GuideTemplateCategory; settings: GuideTemplateSettings };
export type BuiltInGuideTemplate = TemplateBase & { source: "builtIn"; userId: null; nameKey: "minimal" | "technical" | "editorial"; createdAt: null; updatedAt: null };
export type UserGuideTemplate = TemplateBase & { source: "user"; userId: string; name: string; createdAt: Date; updatedAt: Date };
export type GuideLibraryTemplate = BuiltInGuideTemplate | UserGuideTemplate;
export type CreateUserGuideTemplateInput = Pick<UserGuideTemplate, "name" | "category" | "settings">;
