"use client";

import React, { useState } from "react";
import { Mail, AlertCircle, ArrowLeft, Send } from "lucide-react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useTranslation } from "@/hooks/useTranslation";

interface Props { onBackToLogin?: () => void; }

export default function ResetPasswordForm({ onBackToLogin }: Props) {
  const { forgotPassword, isLoading } = useAuthStore();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent]   = useState(false);

  const handleReset = async () => {
    setError("");
    if (!email)                       { setError(t("auth", "form.errors.emailRequired") || "Please enter your email"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError(t("auth", "form.errors.invalidEmail") || "Please enter a valid email address"); return; }
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("auth", "form.errors.resetFailed") || "Something went wrong. Please try again.");
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) handleReset();
  };

  // ── Sent state ──────────────────────────────────────────────
  if (sent) {
    return (
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "16px 0", animation: "agFadeUp .45s ease both" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "rgba(1,71,255,0.1)", border: "1px solid rgba(1,71,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Send style={{ width: "32px", height: "32px", color: "#0147FF" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--text-1)", letterSpacing: "-0.5px", marginBottom: "10px" }}>
            {t("auth", "reset.sent.title") || "Check your inbox"}
          </h2>
          <p style={{ fontFamily: "'Syne',sans-serif", fontSize: "14px", color: "var(--text-3)", lineHeight: 1.7, maxWidth: "280px" }}>
            {t("auth", "reset.sent.subtitle") || "We sent a password reset link to"}{" "}
            <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{email}</span>
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginTop: "8px" }}>
          <button onClick={() => { setSent(false); setEmail(""); }} className="ag-ghost" style={{ fontSize: "13px" }}>
            {t("auth", "reset.sent.tryAgain") || "Didn't receive it? Try again"}
          </button>
          <button onClick={onBackToLogin} className="ag-ghost" style={{ fontSize: "13px" }}>
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            {t("auth", "reset.sent.backToSignIn") || "Back to Sign In"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ag-stack" style={{ animation: "agFadeUp .45s cubic-bezier(.16,1,.3,1) both" }}>
      <div>
        <h1 className="ag-h1">{t("auth", "reset.title") || "Reset Password"}</h1>
        <p className="ag-sub">{t("auth", "reset.subtitle") || "Enter your email and we'll send you a reset link"}</p>
      </div>

      <div className="ag-form">
        <div className="ag-wrap">
          <input
            type="email"
            placeholder={t("auth", "form.emailPlaceholder") || "Email address"}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyPress={onKey}
            disabled={isLoading}
            className="ag-inp"
            autoFocus
          />
          <Mail size={16} color="#0147FF" style={{ flexShrink: 0 }} />
        </div>
        {error && (
          <div className="ag-err">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="ag-form">
        <button className="ag-btn" onClick={handleReset} disabled={isLoading}>
          {isLoading
            ? <>
                <span className="ag-spinner" />
                {t("auth", "reset.sending") || "Sending link…"}
              </>
            : <>
                <Send size={14} />
                {t("auth", "reset.send") || "Send Reset Link"}
              </>
          }
        </button>
        <div style={{ textAlign: "center" }}>
          <button onClick={onBackToLogin} className="ag-ghost">
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            {t("auth", "reset.backToSignIn") || "Back to Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}