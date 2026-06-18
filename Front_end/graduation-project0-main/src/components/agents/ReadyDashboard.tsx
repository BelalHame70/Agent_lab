"use client"

import { useState } from "react"
import type { Agent } from "@/lib/api"
import TestTab from "./tabs/TestTab"
import WidgetTab from "./tabs/WidgetTab"
import { FileText, MessageSquare, Zap } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"

export default function ReadyDashboard({ agent }: { agent: Agent }) {
  const { t } = useTranslation()

  const [messageCount, setMessageCount] = useState(0)
  const filesCount = agent.files?.length ?? 0

const type = (() => {
  switch (String(agent.agent_type)) {
    case "knowledge_base":
      return t("agent", "knowledgeBase")

    case "analysis":
      return t("agent", "analysis")

    case "customer_support":
      return t("agent", "customerSupport")

    default:
      return String(agent.agent_type).replace(/_/g, " ")
  }
})()

  return (
    <div className="flex flex-col gap-6 ag-fade">
      {/* Ready indicator */}
      <div className="flex items-center justify-between">
        <div
          style={{
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "8px",
            padding: "6px 14px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#22c55e",
              flexShrink: 0,
            }}
            className="ag-pulse"
          />
          <span
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "12px",
              fontWeight: 600,
              color: "#22c55e",
            }}
          >
            {t("ready", "agentReady")}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: <FileText size={14} />,
            label: t("ready", "filesUploaded"),
            value: String(filesCount),
          },
          {
            icon: <MessageSquare size={14} />,
            label: t("ready", "messagesSent"),
            value: String(messageCount),
          },
          {
            icon: <Zap size={14} />,
            label: t("ready", "agentType"),
            value: type,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--card)",
              border: `1px solid var(--border)`,
              borderRadius: "16px",
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--text-3)",
                marginBottom: "8px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ flexShrink: 0 }}>{stat.icon}</span>

              <span
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  lineHeight: 1.3,
                }}
              >
                {stat.label}
              </span>
            </div>

            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "clamp(14px, 4vw, 22px)",
                fontWeight: 800,
                color: "var(--text-1)",
                letterSpacing: "-0.5px",
                textTransform: "capitalize",
                wordBreak: "break-word",
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Two columns → stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-5">
        {/* Test Chat */}
        <div
          className="md:order-2"
          style={{
            background: "var(--card)",
            border: `1px solid var(--border)`,
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid var(--border)`,
              flexShrink: 0,
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-1)",
              }}
            >
              {t("ready", "test")}
            </p>
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <TestTab
              agentId={agent.agent_id}
              onMessageSent={() =>
                setMessageCount((prev) => prev + 1)
              }
            />
          </div>
        </div>

        {/* Widget */}
        <div
          className="md:order-1"
          style={{
            background: "var(--card)",
            border: `1px solid var(--border)`,
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid var(--border)`,
              flexShrink: 0,
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-1)",
              }}
            >
              {t("ready", "widget")}
            </p>

            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "11px",
                color: "var(--text-3)",
                marginTop: "2px",
              }}
            >
              {t("ready", "widgetSubtitle")}
            </p>
          </div>

          <div
            style={{
              padding: "20px",
              flex: 1,
              overflowY: "auto",
            }}
          >
            <WidgetTab agentId={agent.agent_id} />
          </div>
        </div>
      </div>
    </div>
  )
}