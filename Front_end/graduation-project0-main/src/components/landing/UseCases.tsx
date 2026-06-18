"use client";

import { useReveal } from "@/hooks/useReveal";
import { useTranslation } from "@/hooks/useTranslation";

function UseCases() {
  const { t } = useTranslation();

  // Get use cases from translations with fallbacks
  const USE_CASES = [
    {
      title: t("useCases", "items.0.title") || "Customer Support Chatbots",
      body: t("useCases", "items.0.body") || "Automate customer inquiries with intelligent chatbots trained on your support documentation.",
    },
    {
      title: t("useCases", "items.1.title") || "Internal Company Assistants",
      body: t("useCases", "items.1.body") || "Help employees find information quickly with AI assistants trained on internal resources.",
    },
    {
      title: t("useCases", "items.2.title") || "Knowledge Base Bots",
      body: t("useCases", "items.2.body") || "Transform your documentation into an interactive AI that answers questions instantly.",
    },
    {
      title: t("useCases", "items.3.title") || "SaaS AI Integrations",
      body: t("useCases", "items.3.body") || "Add intelligent features to your SaaS product with custom-trained AI capabilities.",
    },
  ];

  const headerRef = useReveal();
  const ref0 = useReveal();
  const ref1 = useReveal();
  const ref2 = useReveal();
  const ref3 = useReveal();
  const cardRefs = [ref0, ref1, ref2, ref3];

  return (
    <section className="usecases" id="usecases">
      <div className="container">
        <div className="reveal" ref={headerRef} style={{ textAlign: "center" }}>
          <h2 className="section-title">
            {t("useCases", "sectionTitle")}
          </h2>
        </div>
        <div className="usecases-grid">
          {USE_CASES.map((u, i) => (
            <div
              className="usecase-card reveal"
              ref={cardRefs[i]}
              key={i}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
            
              <div className="usecase-title">{u.title}</div>
              <p className="usecase-body">{u.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UseCases;
