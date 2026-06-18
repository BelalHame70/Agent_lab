"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

// ═══════════════════════════════════════════════════════════════
function Footer() {
  const [email, setEmail] = useState("");
  const { t, locale, changeLocale } = useTranslation();

  return (
    <footer>
      <div className="footer-top">
        <div>
          <div className="footer-logo">AgentLab</div>
          <p className="footer-tagline">
            {t("footer", "tagline")}
          </p>
        </div>
        <div>
          <div className="footer-newsletter-title">
            {t("footer", "newsletterTitle")}
          </div>
          <div className="footer-newsletter-sub">
            {t("footer", "newsletterSub")}
          </div>
          <div className="newsletter-row">
            <input
              type="email"
              placeholder={t("footer", "emailPlaceholder")}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button className="newsletter-submit">
              {t("footer", "subscribe")}
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-links">
          <a href="#">{t("footer", "terms")}</a>
          <a href="#">{t("footer", "privacy")}</a>
          <a href="#">{t("footer", "cookie")}</a>
        </div>

        {/* Language Toggle */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "4px",
          }}
        >
          {(["en", "ar"] as const).map((lang) => {
            const isActive = locale === lang;
            return (
              <button
                key={lang}
                onClick={() => changeLocale(lang)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "9px",
                  border: isActive
                    ? "1px solid rgba(1,71,255,0.3)"
                    : "1px solid transparent",
                  background: isActive
                    ? "rgba(1,71,255,0.12)"
                    : "transparent",
                  color: isActive ? "#0147FF" : "var(--text-3)",
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-2)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-3)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <Globe size={13} />
                {lang === "en" ? "EN" : "ع"}
              </button>
            );
          })}
        </div>

        <p className="footer-copy">
          {t("footer", "copy")}
        </p>
      </div>
    </footer>
  );
}

export default Footer;