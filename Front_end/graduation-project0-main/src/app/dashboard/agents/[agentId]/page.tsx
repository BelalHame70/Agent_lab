"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getAgent, deleteAgent, type Agent } from "@/lib/api"
import UploadSection from "@/components/agents/UploadSection"
import TrainingSection from "@/components/agents/TrainingSection"
import ReadyDashboard from "@/components/agents/ReadyDashboard"
import { Trash2, Loader2 } from "lucide-react"
import { Headphones, BookOpen, BarChart2, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"

const statusConfig: Record<string, { label: string; ringColor: string; dotColor: string }> = {
  idle: {
    label: "Not trained",
    ringColor: "border-white/10 text-white/35",
    dotColor: "bg-white/25",
  },
  processing: {
    label: "Training",
    ringColor: "border-amber-500/30 text-amber-400/80",
    dotColor: "bg-amber-400 animate-pulse",
  },
  ready: {
    label: "Ready",
    ringColor: "border-emerald-500/30 text-emerald-400/80",
    dotColor: "bg-emerald-400",
  },
  failed: {
    label: "Failed",
    ringColor: "border-red-500/30 text-red-400/80",
    dotColor: "bg-red-400",
  },
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  customer_support: <Headphones size={16} />,
  knowledge_base: <BookOpen size={16} />,
  analysis: <BarChart2 size={16} />,
}

function StatusBadge({ status, t }: { status: string; t: (section: string, key: string) => string }) {
  const statusLabels: Record<string, string> = {
    idle: t("agent", "notTrained") || "Not trained",
    processing: t("agent", "training") || "Training",
    ready: t("agent", "ready") || "Ready",
    failed: t("agent", "failed") || "Failed",
  }

  const cfg = statusConfig[status] ?? statusConfig.idle
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        cfg.ringColor
      )}
      style={{ fontFamily: "var(--font-syne)" }}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dotColor)} />
      {statusLabels[status] || cfg.label}
    </span>
  )
}

export default function AgentPage() {
  const { agentId } = useParams()
  const router = useRouter()
  const { t, isRTL } = useTranslation()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchAgent = async () => {
    const data = await getAgent(agentId as string)
    setAgent(data)
    setLoading(false)
  }

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (mounted) fetchAgent() }, [mounted, agentId])
  useEffect(() => {
    if (agent?.ai_status !== "processing") return
    const interval = setInterval(fetchAgent, 5000)
    return () => clearInterval(interval)
  }, [agent?.ai_status])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteAgent(agentId as string)
      router.push("/dashboard")
    } catch {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--black)" }}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-text-3 border-t-text-1" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm" style={{ background: "var(--black)", color: "var(--text-3)", fontFamily: "var(--font-syne)" }}>
        {t("agent", "notFound") || "Agent not found"}
      </div>
    )
  }

  const agentTypeLabel = agent.agent_type
    .replace(/_/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return (
    <div className="min-h-screen px-4 py-6 sm:py-8" style={{ background: "var(--black)", fontFamily: "var(--font-syne)" }}>
      <div className="mx-auto w-full max-w-4xl flex flex-col gap-6 sm:gap-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
          <div className="flex items-center gap-3 min-w-0" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base" style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-1)" }}>
              {TYPE_ICONS[agent.agent_type] ?? <Bot size={16} />}
            </div>
            <div className="min-w-0" style={{ textAlign: isRTL ? "right" : "left" }}>
              <h1 className="text-sm font-semibold truncate" style={{ color: "var(--text-1)", fontFamily: "var(--font-syne)" }}>
                {agent.name}
              </h1>
              <p className="mt-0.5 text-[11px] capitalize truncate" style={{ color: "var(--text-3)", fontFamily: "var(--font-syne)" }}>
                {agentTypeLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
            <StatusBadge status={agent.ai_status} t={t} />
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-lg p-1.5 transition-colors hover:bg-red-500/10 hover:text-red-400"
              style={{ color: "var(--text-3)" }}
              title={t("ready", "deleteTooltip") || "Delete agent"}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* divider */}
        <div className="h-px w-full" style={{ background: "var(--border)" }} />

        {/* Content */}
        <div>
          {agent.ai_status === "idle" && (
            <UploadSection agent={agent} onUpdate={fetchAgent} />
          )}
          {agent.ai_status === "processing" && <TrainingSection />}
          {agent.ai_status === "ready" && <ReadyDashboard agent={agent} />}
          {agent.ai_status === "failed" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-red-500/15 px-4 py-3" style={{ background: "rgba(220, 38, 38, 0.05)" }}>
                <p className="text-xs font-semibold text-red-400" style={{ fontFamily: "var(--font-syne)" }}>
                  {t("training", "title") || "Training Failed"}
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-syne)" }}>
                  {t("training", "takesTime") || "Please try uploading your data again"}
                </p>
              </div>
              <UploadSection agent={agent} onUpdate={fetchAgent} />
            </div>
          )}
        </div>

      </div>

      {/* Delete dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setShowConfirm(false)}
          />
          <div 
            className="relative z-10 w-full max-w-xs space-y-5 rounded-2xl border p-6 shadow-2xl" 
            style={{ borderColor: "var(--border)", background: "var(--card)", fontFamily: "var(--font-syne)" }}>
            <div className="space-y-1.5" style={{ textAlign: isRTL ? "right" : "left" }}>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
                {t("delete", "title") || "Delete Agent"}
              </h2>
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-3)" }}>
                {t("delete", "message") || "Are you sure you want to delete"} 
                <span className="font-medium" style={{ color: "var(--text-2)" }}> "{agent.name}"</span>
                {t("delete", "cannot") || "? This action cannot be undone."}
              </p>
            </div>
            <div className="flex justify-end gap-2" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="rounded-lg border px-3 py-1.5 text-[12px] transition hover:opacity-80 disabled:opacity-40"
                style={{ borderColor: "var(--border)", color: "var(--text-3)", fontFamily: "var(--font-syne)" }}
              >
                {t("delete", "cancel") || "Cancel"}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                style={{ background: "rgb(220, 38, 38)", fontFamily: "var(--font-syne)" }}
              >
                {deleting ? (
                  <>
                    <Loader2 size={11} className="animate-spin" />
                    {t("delete", "title") || "Delete"}
                  </>
                ) : (
                  t("delete", "title") || "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}