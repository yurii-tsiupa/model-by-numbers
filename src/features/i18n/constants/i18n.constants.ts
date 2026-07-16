import type { Locale } from "../types/Locale";
export const DEFAULT_LOCALE:Locale="en";
export const SUPPORTED_LOCALES:readonly Locale[]=["en","uk"];
export const LOCALE_STORAGE_KEY="model-by-numbers-locale";
export const INTL_LOCALES:Record<Locale,string>={en:"en-US",uk:"uk-UA"};
