"use client";

import { useReveal } from "@/hooks/useReveal";
import { useTranslation } from "@/hooks/useTranslation";

function FeatureIcon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d={d} stroke="#0147FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = [
  "M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5",
  "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
];

export default function Features() {
  const { t } = useTranslation();
  const headerRef = useReveal();
  const refs = [useReveal(), useReveal(), useReveal(), useReveal()];

  const items = Array.from({ length: 4 }, (_, i) => ({
    num:   String(i + 1),
    title: t("features", `items.${i}.title`),
    body:  t("features", `items.${i}.body`),
    icon:  ICONS[i],
  }));

  return (
    <section className="features" id="features" style={{ fontFamily: "var(--font-body)" }}>
      <div className="container">
        <div className="features-header">
          <div className="reveal" ref={headerRef}>
            <h2 className="section-title">{t("features", "sectionTitle")}</h2>
            <p className="section-subtitle">{t("features", "sectionSubtitle")}</p>
          </div>
        </div>

        <div className="features-grid">
          {items.map((feature, i) => (
            <div key={i} className="feature-card reveal" ref={refs[i]}
              style={{ transitionDelay: `${i * 0.08}s`, fontFamily: "var(--font-body)" }}>
              <div className="feature-glow" />
              <span className="feature-num">{feature.num}</span>
              <div className="feature-icon"><FeatureIcon d={feature.icon} /></div>
              <div className="feature-title">{feature.title}</div>
              <p className="feature-body">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
