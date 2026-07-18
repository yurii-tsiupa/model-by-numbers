export type GuideTemplateCategory = "minimal" | "technical" | "editorial" | "custom";
export type PageNumberStyle = "numeric" | "numericWithTotal";
export type PageNumberPosition = "bottomLeft" | "bottomCenter" | "bottomRight";

export type GuideTemplateSettings = {
  pageBackground: string;
  textColor: string;
  accentColor: string;
  headingFont: "spaceGrotesk" | "inter";
  bodyFont: "inter" | "spaceGrotesk";
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
