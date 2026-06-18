"use client"

import { useState, useEffect, useCallback } from "react"
import type { Locale } from "@/lib/i18n"

type Messages = Record<string, Record<string, string>>

// ─── Module-level cache (shared across all hook instances) ────
const cache: Partial<Record<Locale, Messages>> = {}

// ─── Custom storage event key ─────────────────────────────────
const LOCALE_KEY   = "app_language"
const LOCALE_EVENT = "agentlab:locale-change"

// ─── Preload messages ─────────────────────────────────────────
async function loadMessages(loc: Locale): Promise<Messages> {
  if (cache[loc]) return cache[loc]!
  const msgs    = await import(`@/messages/${loc}.json`)
  cache[loc]    = msgs.default as Messages
  return cache[loc]!
}

// ═══════════════════════════════════════════════════════════════
export function useTranslation() {
  const [locale,   setLocale]   = useState<Locale>("en")
  const [messages, setMessages] = useState<Messages>({})

  // ── Apply locale to <html> ──────────────────────────────────
  const applyLocale = useCallback((loc: Locale, msgs: Messages) => {
    setLocale(loc)
    setMessages(msgs)
    document.documentElement.dir  = loc === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = loc
  }, [])

  // ── Load from localStorage on mount ────────────────────────
  useEffect(() => {
    const saved = (localStorage.getItem(LOCALE_KEY) as Locale) || "en"
    loadMessages(saved).then(msgs => applyLocale(saved, msgs))
  }, [applyLocale])

  // ── Listen for changes from OTHER hook instances ────────────
  // Uses a custom window event so all mounted components re-render
  useEffect(() => {
    const handler = async (e: Event) => {
      const loc  = (e as CustomEvent<Locale>).detail
      const msgs = await loadMessages(loc)
      applyLocale(loc, msgs)
    }
    window.addEventListener(LOCALE_EVENT, handler)
    return () => window.removeEventListener(LOCALE_EVENT, handler)
  }, [applyLocale])

  // ── changeLocale — broadcasts to all instances ──────────────
  const changeLocale = useCallback(async (loc: Locale) => {
    localStorage.setItem(LOCALE_KEY, loc)
    const msgs = await loadMessages(loc)
    applyLocale(loc, msgs)
    // Notify every other component using this hook
    window.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: loc }))
  }, [applyLocale])

  // ── t() ────────────────────────────────────────────────────
const t = useCallback((section: string, key: string): string => {
  const value = key
    .split(".")
    .reduce((obj: any, k) => obj?.[k], messages?.[section])

  return typeof value === "string" ? value : key
}, [messages])

return {
  t,
  locale,
  changeLocale,
  isRTL: locale === "ar",
}
}