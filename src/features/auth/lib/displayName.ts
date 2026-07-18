export const MIN_DISPLAY_NAME_LENGTH=2;
export const MAX_DISPLAY_NAME_LENGTH=50;
export function normalizeDisplayName(value:string):string{return value.trim().replace(/\s+/gu," ");}
export function getUserDisplayName({profileDisplayName,authDisplayName,fallback}:{profileDisplayName?:string|null;authDisplayName?:string|null;fallback:string}):string{return normalizeDisplayName(profileDisplayName??"")||normalizeDisplayName(authDisplayName??"")||fallback;}
export function getDisplayNameInitial(displayName:string):string|null{return Array.from(normalizeDisplayName(displayName))[0]?.toLocaleUpperCase()??null;}
