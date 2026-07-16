"use client";
import { useContext } from "react";
import { I18nContext } from "../context/I18nProvider";
export function useTranslation(){const value=useContext(I18nContext);if(!value)throw new Error("useTranslation must be used within I18nProvider");return value;}
