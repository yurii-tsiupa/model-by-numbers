import { SettingsPage, type SettingsTab } from "@/components/profile/SettingsPage";

const isSettingsTab = (value: unknown): value is SettingsTab => value === "account" || value === "brand" || value === "backgrounds";

export default async function SettingsRoute({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const { tab } = await searchParams;
  const requestedTab = Array.isArray(tab) ? tab[0] : tab;
  const activeTab = isSettingsTab(requestedTab) ? requestedTab : "account";
  return <SettingsPage activeTab={activeTab} />;
}
