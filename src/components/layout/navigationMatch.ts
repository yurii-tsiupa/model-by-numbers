export type NavigationItem = { id: "models" | "guides" | "templates" | "howItWorks" | "guidePreview"; href: string; labelKey: "header.nav.models" | "header.nav.guides" | "header.nav.templates" | "header.nav.howItWorks" | "header.nav.guidePreview" };

const matchesSection = (pathname: string, basePath: string) => pathname === basePath || pathname.startsWith(`${basePath}/`);
const isNestedGuide = (pathname: string) => /^\/models\/[^/]+\/guide(?:\/|$)|^\/models\/[^/]+\/guides\/[^/]+(?:\/|$)/.test(pathname);

export function isNavigationItemActive(item: NavigationItem, pathname: string): boolean {
  if (item.id === "guides") return matchesSection(pathname, "/guides") || isNestedGuide(pathname);
  if (item.id === "models") return matchesSection(pathname, "/models") && !isNestedGuide(pathname);
  if (item.id === "templates") return matchesSection(pathname, "/templates");
  return false;
}
