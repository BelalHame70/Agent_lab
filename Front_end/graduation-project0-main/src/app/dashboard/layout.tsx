"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/useAuthStore"
import AppSidebar from "@/components/layout/AppSidebar"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router                                          = useRouter()
  const { accessToken, fetchProfile, user, refreshToken } = useAuthStore()
  const [ready, setReady]                               = useState(false)
  const refreshInterval                                 = useRef<NodeJS.Timeout | null>(null)
  const initRunning                                     = useRef(false)   // ← guard against double-invoke (Strict Mode)

  // ── Redirect helper ─────────────────────────────────────────────────────
  const redirectToAuth = useCallback(() => {
    router.replace("/auth")
  }, [router])

  // ── Boot sequence ────────────────────────────────────────────────────────
  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (initRunning.current) return
    initRunning.current = true

    const init = async () => {
      try {
        // 1. No access token → try to silently refresh first
        if (!accessToken) {
          await refreshToken()   // throws if refresh cookie is missing / expired
        }

        // 2. Profile not loaded yet → fetch it (token is now valid)
        if (!user) {
          await fetchProfile()
        }

        setReady(true)
      } catch {
        // Any failure in the boot chain → send to login
        redirectToAuth()
      }
    }

    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // ^ Intentionally empty: we only want this to run once on mount.
  //   `accessToken`, `user`, and the store functions are stable refs —
  //   adding them would re-trigger the whole auth flow on every render.

  // ── Periodic silent refresh (every 10 min) ───────────────────────────────
  useEffect(() => {
    if (!ready) return

    refreshInterval.current = setInterval(async () => {
      try {
        await refreshToken()
      } catch {
        // Refresh failed mid-session → kick back to login
        redirectToAuth()
      }
    }, 10 * 60 * 1000)

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current)
    }
  }, [ready, refreshToken, redirectToAuth])

  // ── Loading screen ───────────────────────────────────────────────────────
  if (!ready) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "var(--black)" }}
      >
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
      </div>
    )
  }

  // ── App shell ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--black)" }}>
      <div className="dark">
        <AppSidebar />
      </div>
      <main
        className={cn(
          "flex-1 overflow-y-auto",
          "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
        )}
        style={{ background: "var(--black)" }}
      >
        {children}
      </main>
    </div>
  )
}