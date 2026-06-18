"use client"

import { useState, useRef, useEffect } from "react"
import { testAgent } from "@/lib/api"
import { Send, Loader2, Bot } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"

type Message = { role: "user" | "agent"; content: string }
type Props = { agentId: string; onMessageSent?: () => void }

export default function TestTab({ agentId, onMessageSent }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { t, isRTL } = useTranslation()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setLoading(true)
    onMessageSent?.()
    try {
const answer = await testAgent(agentId, text)
setMessages((prev) => [...prev, { role: "agent", content: answer }])
    } catch {
      setMessages((prev) => [...prev, { role: "agent", content: "Something went wrong." }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "clamp(320px, 60vh, 520px)",
        borderRadius: "16px",
        overflow: "hidden",
        border: `1px solid var(--border)`,
        background: "var(--surface)",
      }}
    >
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.08) transparent",
        }}
      >
        {messages.length === 0 && (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            opacity: 0.5,
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "rgba(1,71,255,0.08)",
              border: "1px solid rgba(1,71,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={18} style={{ color: "#0147FF" }} />
            </div>
            <p style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "12px",
              color: "var(--text-3)",
              textAlign: "center",
              padding: "0 16px",
            }}>
              {t("test", "startConversation")}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              animation: "agFadeUp 0.2s ease both",
            }}
          >
            {msg.role === "agent" && (
              <div style={{
                width: "24px", height: "24px", borderRadius: "8px",
                background: "rgba(1,71,255,0.08)",
                border: "1px solid rgba(1,71,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                marginRight: "8px",
                marginTop: "2px",
              }}>
                <Bot size={12} style={{ color: "#0147FF" }} />
              </div>
            )}
            <div style={{
              maxWidth: "78%",
              padding: "10px 14px",
              borderRadius: msg.role === "user"
                ? isRTL ? "16px 16px 16px 4px" : "16px 16px 4px 16px"
                : isRTL ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.role === "user" ? "#0147FF" : "var(--card)",
              border: msg.role === "user" ? "none" : `1px solid var(--border)`,
              fontFamily: "var(--font-dm-sans)",
              fontSize: "13px",
              color: msg.role === "user" ? "#fff" : "var(--text-1)",
              lineHeight: 1.6,
              wordBreak: "break-word",
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading bubble */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: "8px" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "8px",
              background: "rgba(1,71,255,0.08)",
              border: "1px solid rgba(1,71,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Loader2 size={12} style={{ color: "#0147FF" }} className="animate-spin" />
            </div>
            <div style={{
              padding: "10px 14px",
              borderRadius: "16px 16px 16px 4px",
              background: "var(--card)",
              border: `1px solid var(--border)`,
              display: "flex", gap: "5px", alignItems: "center",
            }}>
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  style={{
                    width: "5px", height: "5px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.3)",
                    display: "inline-block",
                    animation: "agPulse 1.2s ease-in-out infinite",
                    animationDelay: `${delay}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)", flexShrink: 0 }} />

      {/* Input */}
      <div style={{
        padding: "10px 12px",
        display: "flex",
        gap: "8px",
        alignItems: "center",
        flexShrink: 0,
        background: "var(--surface)",
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={loading}
          placeholder={t("test", "placeholder")}
          style={{
            flex: 1,
            minWidth: 0,
            background: "var(--input-bg)",
            border: `1px solid var(--border)`,
            borderRadius: "10px",
            padding: "9px 12px",
            fontFamily: "var(--font-dm-sans)",
            fontSize: "13px",
            color: "var(--text-1)",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => e.target.style.borderColor = "rgba(1,71,255,0.5)"}
          onBlur={(e) => e.target.style.borderColor = "var(--border)"}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            width: "34px",
            height: "34px",
            flexShrink: 0,
            background: input.trim() && !loading ? "#0147FF" : "var(--input-bg)",
            border: `1px solid ${input.trim() && !loading ? "rgba(1,71,255,0.4)" : "var(--border)"}`,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            color: input.trim() && !loading ? "#fff" : "var(--text-3)",
            transition: "all 0.15s",
            boxShadow: input.trim() && !loading ? "0 4px 12px rgba(1,71,255,0.25)" : "none",
          }}
          onMouseEnter={(e) => {
            if (input.trim() && !loading) {
              e.currentTarget.style.background = "#1a5cff"
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(1,71,255,0.35)"
            }
          }}
          onMouseLeave={(e) => {
            if (input.trim() && !loading) {
              e.currentTarget.style.background = "#0147FF"
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(1,71,255,0.25)"
            }
          }}
        >
          {loading
            ? <Loader2 size={13} className="animate-spin" />
            : <Send size={13} />
          }
        </button>
      </div>
    </div>
  )
}