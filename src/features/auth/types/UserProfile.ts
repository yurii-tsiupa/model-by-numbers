import type { UserBrandDefaults } from "./UserBrandDefaults";
import type { UserBrandAssets } from "./UserBrandAssets";

export type UserProfile = { id: string; email: string; displayName: string; photoUrl: string | null; brandDefaults: UserBrandDefaults; brandAssets: UserBrandAssets };
