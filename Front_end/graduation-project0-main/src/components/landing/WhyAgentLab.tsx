"use client";

import { useReveal } from "@/hooks/useReveal";
import { useTranslation } from "@/hooks/useTranslation";

function WhyAgentLab() {
  const ref = useReveal();
  const { t } = useTranslation();

  const WHY = [
    {
      stat: t("why", "items.0.stat") || "24/7",
      title: t("why", "items.0.title") || "Instant Responses",
      body: t("why", "items.0.body") || "Never miss a customer query with AI agents that work around the clock.",
    },
    {
      stat: t("why", "items.1.stat") || "80%",
      title: t("why", "items.1.title") || "Reduce Support Costs",
      body: t("why", "items.1.body") || "Automate repetitive tasks and scale support without hiring more staff.",
    },
    {
      stat: t("why", "items.2.stat") || "RAG",
      title: t("why", "items.2.title") || "Accurate, Data-Driven",
      body: t("why", "items.2.body") || "Leverage RAG technology to provide precise responses based on your data.",
    },
    {
      stat: t("why", "items.3.stat") || "REST",
      title: t("why", "items.3.title") || "Easy API Integration",
      body: t("why", "items.3.body") || "Simple REST API integration that works with any platform or framework.",
    },
  ];

  return (
    <section className="why" id="why">
      <div className="container">
        <div className="reveal" ref={ref} style={{ textAlign: "center" }}>
          <div className="section-label">
            {t("why", "sectionLabel") || "Advantages"}
          </div>
          <h2 className="section-title">
            {t("why", "sectionTitle") || "Why Choose AgentLab"}
          </h2>
        </div>
        <div className="why-grid">
          {WHY.map((w, i) => {
            const r = useReveal();
            return (
              <div
                className="why-card reveal"
                ref={r}
                key={i}
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div className="why-stat" style={{ fontFamily: "var(--font-display)" }}>{w.stat}</div>
                <div className="why-title" style={{ fontFamily: "var(--font-display)" }}>{w.title}</div>
                <p className="why-body">{w.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyAgentLab;