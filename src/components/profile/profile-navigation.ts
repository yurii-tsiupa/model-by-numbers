export const PROFILE_NAVIGATION = [
  { href: "/profile", labelKey: "profile.navigation.overview", exact: true },
  { href: "/profile/models", labelKey: "profile.navigation.models", exact: false },
  { href: "/profile/guides", labelKey: "profile.navigation.guides", exact: false },
  { href: "/profile/templates", labelKey: "profile.navigation.templates", exact: false },
  { href: "/profile/account", labelKey: "profile.navigation.account", exact: false },
] as const;

export function isProfileRouteActive(pathname: string, item: (typeof PROFILE_NAVIGATION)[number]): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}
