"use client"

import { useEffect, useState, type ReactNode } from "react"
import { getWidget, createWidget, type Widget } from "@/lib/api"
import { Copy, Check, Zap, Loader2 } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"

type FullWidget = Widget & { publicKey?: string; embed_code?: string }

/* Small helper so the two numbered/icon circles don't repeat full style blocks */
function StepBadge({
  children,
  size = 18,
  variant = "outline",
}: {
  children: ReactNode
  size?: number
  variant?: "filled" | "outline"
}) {
  return (
    <span
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: variant === "filled" ? "rgba(1,71,255,0.15)" : "rgba(1,71,255,0.08)",
        border: `1px solid rgba(1,71,255,${variant === "filled" ? 0.25 : 0.15})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: "var(--font-syne)",
        fontSize: variant === "filled" ? "10px" : "9px",
        fontWeight: 800,
        color: "#0147FF",
      }}
    >
      {children}
    </span>
  )
}

export default function WidgetTab({ agentId }: { agentId: string }) {
  const [widget, setWidget]     = useState<FullWidget | null>(null)
  const [loading, setLoading]   = useState(true)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied]     = useState<"code" | "key" | null>(null)
  const { t } = useTranslation()

  const HOW_TO_USE_STEPS = [
    {
      step: "1",
      title: t("widget", "step1Title"),
      desc: t("widget", "step1Desc"),
    },
    {
      step: "2",
      title: t("widget", "step2Title"),
      desc: t("widget", "step2Desc"),
    },
    {
      step: "3",
      title: t("widget", "step3Title"),
      desc: t("widget", "step3Desc"),
    },
  ]

  useEffect(() => {
    getWidget(agentId).then((data) => {
      setWidget(data)
      setLoading(false)
    })
  }, [agentId])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const data = await createWidget(agentId)
      setWidget(data)
    } catch {
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = (type: "code" | "key") => {
    if (!widget) return
    const text = type === "code"
      ? widget.embed_code
      : (widget.public_key ?? widget.publicKey)
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={16} style={{ color: "#0147FF" }} className="animate-spin" />
    </div>
  )

  if (!widget) return (
    <div className="flex flex-col items-center justify-center py-10 gap-4 text-center px-4">
      <div style={{ background: "rgba(1,71,255,0.08)", border: "1px solid rgba(1,71,255,0.2)", borderRadius: "12px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Zap size={16} style={{ color: "#0147FF" }} />
      </div>
      <div>
        <p style={{ fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>{t("widget", "noWidget")}</p>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: "var(--text-3)", marginTop: "4px" }}>{t("widget", "noWidgetSubtitle")}</p>
      </div>
      <button onClick={handleCreate} disabled={creating} style={{ background: "#0147FF", borderRadius: "10px", padding: "8px 16px", fontFamily: "var(--font-syne)", fontSize: "12px", fontWeight: 700, color: "#fff", border: "none", cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.6 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
        {creating ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
        {creating ? t("widget", "creating") : t("widget", "createWidget")}
      </button>
    </div>
  )

  const embedCode = widget.embed_code
  const publicKey = widget.public_key ?? widget.publicKey

  return (
    <div className="space-y-4">
      {/* Status */}
      <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 600, color: "#22c55e" }}>
          {widget.active ? t("widget", "widgetActive") : t("widget", "widgetInactive")}
        </span>
      </div>

      {/* Embed Code */}
      {embedCode ? (
        <div className="space-y-2">
          <p style={{ fontFamily: "var(--font-syne)", fontSize: "11px", fontWeight: 700, color: "var(--text-3)", letterSpacing: "2px", textTransform: "uppercase" }}>{t("widget", "embedCode")}</p>
          <div style={{ position: "relative" }}>
            <pre style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px", paddingRight: "40px", fontFamily: "monospace", fontSize: "11px", color: "var(--text-2)", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.6, margin: 0 }}>
              {embedCode}
            </pre>
            <button onClick={() => handleCopy("code")} style={{ position: "absolute", top: "8px", right: "8px", background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: "6px", padding: "4px 6px", cursor: "pointer", color: copied === "code" ? "#22c55e" : "var(--text-3)" }}>
              {copied === "code" ? <Check size={11} /> : <Copy size={11} />}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "12px", borderRadius: "10px", background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: "var(--text-3)", marginBottom: "8px" }}>Embed code not available.</p>
          <button onClick={handleCreate} disabled={creating} style={{ background: "#0147FF", borderRadius: "8px", padding: "6px 12px", fontFamily: "var(--font-syne)", fontSize: "12px", fontWeight: 700, color: "#fff", border: "none", cursor: "pointer" }}>
            {creating ? "Loading..." : "Get Embed Code"}
          </button>
        </div>
      )}

      {/* Public Key */}
      {publicKey && (
        <div className="space-y-2">
          <p style={{ fontFamily: "var(--font-syne)", fontSize: "11px", fontWeight: 700, color: "var(--text-3)", letterSpacing: "2px", textTransform: "uppercase" }}>{t("widget", "publicKey")}</p>
          <div style={{ position: "relative" }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "10px 40px 10px 12px", fontFamily: "monospace", fontSize: "11px", color: "var(--text-2)", wordBreak: "break-all" }}>
              {publicKey}
            </div>
            <button onClick={() => handleCopy("key")} style={{ position: "absolute", top: "8px", right: "8px", background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: "6px", padding: "4px 6px", cursor: "pointer", color: copied === "key" ? "#22c55e" : "var(--text-3)" }}>
              {copied === "key" ? <Check size={11} /> : <Copy size={11} />}
            </button>
          </div>
        </div>
      )}

      {/* How to use */}
      {embedCode && (
        <div style={{
          background: "rgba(1,71,255,0.04)",
          border: "1px solid rgba(1,71,255,0.12)",
          borderRadius: "12px",
          padding: "14px 16px",
          marginTop: "4px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <StepBadge variant="filled">i</StepBadge>
            <p style={{ fontFamily: "var(--font-syne)", fontSize: "11px", fontWeight: 700, color: "#0147FF", letterSpacing: "0.5px" }}>
            {t("widget", "howToUse")}            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {HOW_TO_USE_STEPS.map((item) => (
              <div key={item.step} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ marginTop: "1px" }}>
                  <StepBadge>{item.step}</StepBadge>
                </span>
                <p style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "11px",
                  color: "var(--text-3)",
                  lineHeight: 1.5,
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}