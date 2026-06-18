// lib/i18n.ts

export type Locale = "en" | "ar"

export const defaultLocale: Locale = "en"

export const getLocale = (): Locale => {
  if (typeof window === "undefined") return defaultLocale
  return (localStorage.getItem("app_language") as Locale) || defaultLocale
}

export const isRTL = (locale: Locale) => locale === "ar"