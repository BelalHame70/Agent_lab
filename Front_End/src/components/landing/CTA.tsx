"use client";

import { useReveal } from "@/hooks/useReveal";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link"


function ArrowIcon() {
  return (
    <svg className="arrow-icon" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
function CTA() {
  const ref = useReveal();
  const { t } = useTranslation();

  return (
    <section className="cta">
      <div className="container">
        <div className="cta-inner reveal" ref={ref}>
          <div className="cta-bg" />
          <h2 className="cta-title">
            {t("cta", "title") || "Start Building Your AI Agent Today"}
          </h2>
          <p className="cta-sub">
            {t("cta", "subtitle") || "Join hundreds of companies using AgentLab to automate customer support and deploy intelligent AI solutions."}
          </p>
          <div className="cta-actions">
<Link href="/auth?mode=register">
  <button
    className="btn-primary"
    style={{ fontSize: "18px", padding: "20px 48px" }}
  >
    {t("cta", "primary") || "Create Your First Agent"} <ArrowIcon />
  </button>
</Link>
            <button className="btn-ghost" style={{ fontSize: "16px", padding: "20px 36px" }}>
              {t("cta", "secondary") || "View Docs"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTA;