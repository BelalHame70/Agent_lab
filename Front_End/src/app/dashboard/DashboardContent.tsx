"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import NewAgentModal from "@/components/agents/NewAgentModal"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"

export default function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (searchParams.get("newAgent") === "true") {
      setModalOpen(true)
    }
  }, [searchParams])

  const handleClose = () => {
    setModalOpen(false)
    router.replace("/dashboard")
  }

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: "var(--black)" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(217,119,6,0.06) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex h-full flex-col items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L19.66 7V15L11 20L2.34 15V7L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
              <path d="M11 7L15.33 9.5V14.5L11 17L6.67 14.5V9.5L11 7Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" opacity="0.4" />
            </svg>
          </div>
          <div className="text-center space-y-3">
            <h1 className="text-[28px] font-semibold tracking-tight leading-snug" style={{ color: "var(--text-1)", fontFamily: "var(--font-display)" }}>
              {t("dashboard", "title")}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
              {t("dashboard", "subtitle")}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className={cn(
              "group flex w-full items-center justify-center gap-2",
              "rounded-xl px-5 py-3 text-sm font-medium",
              "border transition-all duration-150",
              "hover:opacity-80 active:scale-[0.98]"
            )}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              borderColor: "var(--border)",
              color: "var(--text-1)",
              fontFamily: "var(--font-body)"
            }}
          >
            <Plus size={15} style={{ color: "var(--text-3)", transition: "color 0.15s" }} className="group-hover:opacity-80" />
            {t("dashboard", "newAgent")}
          </button>
          <div className="flex items-center gap-2">
            {[{ label: t("agent", "knowledgeBase") }, { label: t("agent", "customerSupport") }, { label: t("agent", "analysis") }].map((f) => (
              <span
                key={f.label}
                className="rounded-full border px-3 py-1 text-[11px] font-medium"
                style={{
                  borderColor: "var(--border)",
                  background: "rgba(255, 255, 255, 0.04)",
                  color: "var(--text-3)",
                  fontFamily: "var(--font-body)"
                }}
              >
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <NewAgentModal open={modalOpen} onClose={handleClose} />
    </div>
  )
}