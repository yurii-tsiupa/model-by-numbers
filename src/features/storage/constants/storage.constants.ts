import { LOCAL_DATABASE_STORES } from "../lib/localDatabase";
export const STORAGE_STORES = {
  guide: LOCAL_DATABASE_STORES.guides,
  reference: LOCAL_DATABASE_STORES.references,
  thumbnail: LOCAL_DATABASE_STORES.thumbnails,
  "assembly-step-image": LOCAL_DATABASE_STORES.assemblyStepImages,
} as const;
