"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Props {
  onBackToLogin?: () => void;
}

function getStrength(pw: string) {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let s = 0;
  if (pw.length >= 8)           s++;
  if (pw.length >= 12)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: "Weak",   color: "#ef4444" };
  if (s <= 2) return { score: s, label: "Fair",   color: "#f59e0b" };
  if (s <= 3) return { score: s, label: "Good",   color: "#3b82f6" };
  return              { score: s, label: "Strong", color: "#22c55e" };
}

type Step = "form" | "success" | "invalid_token";

export default function SetNewPasswordForm({ onBackToLogin }: Props) {
  const { t }          = useTranslation();
  const searchParams   = useSearchParams();
  const token          = searchParams.get("token");

  const [step, setStep]               = useState<Step>(token ? "form" : "invalid_token");
  const [newPw, setNewPw]             = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState("");
  const [isLoading, setIsLoading]     = useState(false);

  const strength = useMemo(() => getStrength(newPw), [newPw]);

  const strengthLabel = useMemo(() => {
    if (strength.score <= 1) return t("auth", "register.strength.weak")   || "Weak";
    if (strength.score <= 2) return t("auth", "register.strength.fair")   || "Fair";
    if (strength.score <= 3) return t("auth", "register.strength.good")   || "Good";
    return                          t("auth", "register.strength.strong") || "Strong";
  }, [strength.score, t]);

  // Re-check token if URL changes
  useEffect(() => {
    if (!token) setStep("invalid_token");
  }, [token]);

  const validate = (): string | null => {
    if (!newPw)           return t("auth", "resetPassword.errors.newRequired")    || "Please enter a new password";
    if (!confirmPw)       return t("auth", "resetPassword.errors.confirmRequired") || "Please confirm your new password";
    if (newPw.length < 6) return t("auth", "form.errors.passwordMin")             || "Password must be at least 6 characters";
    if (newPw !== confirmPw) return t("auth", "form.errors.passwordMismatch")     || "Passwords do not match";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/v1/auth/change-password?token=${encodeURIComponent(token!)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: newPw }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // Treat expired / invalid token as a special state
        if (res.status === 400 || res.status === 401 || res.status === 404) {
          setStep("invalid_token");
          return;
        }
        throw new Error(body?.message || t("auth", "resetPassword.errors.failed") || "Something went wrong.");
      }

      setStep("success");
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : t("auth", "resetPassword.errors.failed") || "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) handleSubmit();
  };

  // ── Invalid / missing token ──────────────────────────────
  if (step === "invalid_token") {
    return (
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          padding: "16px 0",
          animation: "agFadeUp .45s ease both",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldAlert style={{ width: "34px", height: "34px", color: "#f87171" }} />
        </div>

        <div>
          <h2
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: "26px",
              color: "var(--text-1)",
              letterSpacing: "-0.5px",
              marginBottom: "10px",
            }}
          >
            {t("auth", "resetPassword.invalidToken.title") || "Link Expired"}
          </h2>
          <p
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: "14px",
              color: "var(--text-3)",
              lineHeight: 1.7,
              maxWidth: "280px",
            }}
          >
            {t("auth", "resetPassword.invalidToken.subtitle") ||
              "This reset link is invalid or has expired. Please request a new one."}
          </p>
        </div>

        <button className="ag-btn" onClick={onBackToLogin}>
          {t("auth", "resetPassword.invalidToken.cta") || "Back to Sign In"}
        </button>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────
  if (step === "success") {
    return (
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          padding: "16px 0",
          animation: "agFadeUp .45s ease both",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle style={{ width: "34px", height: "34px", color: "#22c55e" }} />
        </div>

        <div>
          <h2
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: "26px",
              color: "var(--text-1)",
              letterSpacing: "-0.5px",
              marginBottom: "10px",
            }}
          >
            {t("auth", "resetPassword.success.title") || "Password Reset!"}
          </h2>
          <p
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: "14px",
              color: "var(--text-3)",
              lineHeight: 1.7,
              maxWidth: "280px",
            }}
          >
            {t("auth", "resetPassword.success.subtitle") ||
              "Your password has been updated. You can now sign in with your new password."}
          </p>
        </div>

        <button className="ag-btn" onClick={onBackToLogin}>
          {t("auth", "resetPassword.success.cta") || "Go to Sign In"}
        </button>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────
  return (
    <div className="ag-stack" style={{ animation: "agFadeUp .45s cubic-bezier(.16,1,.3,1) both" }}>
      <div>
        <h1 className="ag-h1">
          {t("auth", "resetPassword.title") || "Set New Password"}
        </h1>
        <p className="ag-sub">
          {t("auth", "resetPassword.subtitle") || "Choose a strong password for your account"}
        </p>
      </div>

      <div className="ag-form">
        {/* New password */}
        <div>
          <div className="ag-wrap">
            <input
              type={showNew ? "text" : "password"}
              placeholder={t("auth", "resetPassword.newPlaceholder") || "New password"}
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              onKeyPress={onKey}
              disabled={isLoading}
              className="ag-inp"
              autoComplete="new-password"
              autoFocus
            />
            <button
              type="button"
              className="ag-icon-btn"
              onClick={() => setShowNew(p => !p)}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {newPw && (
            <div>
              <div className="ag-strength-row">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="ag-strength-seg"
                    style={{
                      background:
                        strength.score >= i
                          ? strength.color
                          : "rgba(255,255,255,0.08)",
                    }}
                  />
                ))}
              </div>
              <p
                className="ag-strength-lbl"
                style={{ color: strength.color }}
              >
                {strengthLabel}
              </p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <div className="ag-wrap">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder={t("auth", "resetPassword.confirmPlaceholder") || "Confirm new password"}
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              onKeyPress={onKey}
              disabled={isLoading}
              className="ag-inp"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="ag-icon-btn"
              onClick={() => setShowConfirm(p => !p)}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {confirmPw && newPw !== confirmPw && (
            <p
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: "12px",
                color: "#f87171",
                marginTop: "6px",
                paddingLeft: "8px",
              }}
            >
              {t("auth", "form.errors.passwordMismatch") || "Passwords do not match"}
            </p>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="ag-err">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="ag-form">
        <button
          className="ag-btn"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="ag-spinner" />
              {t("auth", "resetPassword.updating") || "Saving…"}
            </>
          ) : (
            t("auth", "resetPassword.submit") || "Save New Password"
          )}
        </button>

        {onBackToLogin && (
          <p
            style={{
              textAlign: "center",
              fontFamily: "'Syne',sans-serif",
              fontSize: "13px",
              color: "var(--text-3)",
            }}
          >
            <button
              className="ag-link"
              onClick={onBackToLogin}
              disabled={isLoading}
              style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
            >
              <ArrowLeft size={13} />
              {t("auth", "resetPassword.backToLogin") || "Back to Sign In"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}