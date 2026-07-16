"use client";
import { createContext,useCallback,useEffect,useMemo,useState,type ReactNode } from "react";
import { DEFAULT_LOCALE,LOCALE_STORAGE_KEY,SUPPORTED_LOCALES } from "../constants/i18n.constants";
import { translate,type TranslationValues } from "../lib/i18n";
import type { TranslationKey } from "../locales/en";
import type { Locale } from "../types/Locale";
export type I18nContextValue={locale:Locale;setLocale:(locale:Locale)=>void;t:(key:TranslationKey,values?:TranslationValues)=>string};
export const I18nContext=createContext<I18nContextValue|null>(null);
export function I18nProvider({children}:{children:ReactNode}){const [locale,setLocaleState]=useState<Locale>(DEFAULT_LOCALE);useEffect(()=>{const saved=localStorage.getItem(LOCALE_STORAGE_KEY);const initial=SUPPORTED_LOCALES.includes(saved as Locale)?saved as Locale:navigator.language.toLowerCase().startsWith("uk")?"uk":"en";queueMicrotask(()=>setLocaleState(initial));document.documentElement.lang=initial;},[]);const setLocale=useCallback((next:Locale)=>{setLocaleState(next);localStorage.setItem(LOCALE_STORAGE_KEY,next);document.documentElement.lang=next;},[]);const value=useMemo(()=>({locale,setLocale,t:(key:TranslationKey,values?:TranslationValues)=>translate(locale,key,values)}),[locale,setLocale]);return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>}
