"use client";

import React, { useState, useMemo } from "react";
import { User, Mail, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useTranslation } from "@/hooks/useTranslation";

interface Props { onSwitchToLogin?: () => void; }

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

type Step = "form" | "verify";

export default function RegisterForm({ onSwitchToLogin }: Props) {
  const { register, isLoading } = useAuthStore();
  const { t } = useTranslation();

  const [step, setStep]                 = useState<Step>("form");
  const [name, setName]                 = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPw, setConfirmPw]       = useState("");
  const [showPw, setShowPw]             = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [error, setError]               = useState("");

  // ✅ Both useMemo hooks are now BEFORE any early returns
  const strength = useMemo(() => getStrength(password), [password]);

  const strengthLabel = useMemo(() => {
    if (strength.score <= 1) return t("auth", "register.strength.weak") || "Weak";
    if (strength.score <= 2) return t("auth", "register.strength.fair") || "Fair";
    if (strength.score <= 3) return t("auth", "register.strength.good") || "Good";
    return t("auth", "register.strength.strong") || "Strong";
  }, [strength.score, t]);

  const validate = (): string | null => {
    if (!name.trim())                   return t("auth", "form.errors.nameRequired") || "Please enter your name";
    if (!email || !password || !confirmPw) return t("auth", "form.errors.fillAll") || "Please fill in all fields";
    if (!/\S+@\S+\.\S+/.test(email))   return t("auth", "form.errors.invalidEmail") || "Please enter a valid email address";
    if (password.length < 6)            return t("auth", "form.errors.passwordMin") || "Password must be at least 6 characters";
    if (password !== confirmPw)         return t("auth", "form.errors.passwordMismatch") || "Passwords do not match";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    try {
      await register(name.trim(), email, password);
      setStep("verify");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("auth", "form.errors.registerFailed") || "Registration failed. Please try again.");
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) handleSubmit();
  };

  // ── Step 2: Email verification notice ────────────────────
  if (step === "verify") {
    return (
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "16px 0", animation: "agFadeUp .45s ease both" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CheckCircle style={{ width: "34px", height: "34px", color: "#22c55e" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--text-1)", letterSpacing: "-0.5px", marginBottom: "10px" }}>
            {t("auth", "register.verify.title") || "Verify your email"}
          </h2>
          <p style={{ fontFamily: "'Syne',sans-serif", fontSize: "14px", color: "var(--text-3)", lineHeight: 1.7, maxWidth: "280px" }}>
            {t("auth", "register.verify.subtitle") || "We sent a verification link to"}{" "}
            <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{email}</span>
            {". " + (t("auth", "register.verify.checkInbox") || "Please check your inbox.")}
          </p>
        </div>
        <button
          onClick={() => {
            if (onSwitchToLogin) {
              onSwitchToLogin();
            } else {
              window.location.href = "/auth";
            }
          }}
          className="ag-btn"
        >
          {t("auth", "register.verify.goToSignIn") || "Go to Sign In"}
        </button>
        <p style={{ fontFamily: "'Syne',sans-serif", fontSize: "12px", color: "var(--text-3)" }}>
          {t("auth", "register.verify.didntReceive") || "Didn't receive it?"}{" "}
          <button
            onClick={async () => {
              const { resendVerification } = await import("@/lib/authApi");
              await resendVerification(email);
            }}
            className="ag-link"
            style={{ fontSize: "12px" }}
          >
            {t("auth", "register.verify.resend") || "Resend"}
          </button>
        </p>
      </div>
    );
  }

  // ── Step 1: Registration form ────────────────────────────
  return (
    <div className="ag-stack" style={{ animation: "agFadeUp .45s cubic-bezier(.16,1,.3,1) both" }}>
      <div>
        <h1 className="ag-h1">{t("auth", "register.title") || "Create Account"}</h1>
        <p className="ag-sub">{t("auth", "register.subtitle") || "Sign up to get started with your AI agents"}</p>
      </div>

      <div className="ag-form">
        {/* Name */}
        <div className="ag-wrap">
          <input
            type="text"
            placeholder={t("auth", "form.namePlaceholder") || "Full name"}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyPress={onKey}
            disabled={isLoading}
            className="ag-inp"
            autoComplete="name"
            autoFocus
          />
          <User size={16} color="#0147FF" style={{ flexShrink: 0 }} />
        </div>

        {/* Email */}
        <div className="ag-wrap">
          <input
            type="email"
            placeholder={t("auth", "form.emailPlaceholder") || "Email address"}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyPress={onKey}
            disabled={isLoading}
            className="ag-inp"
            autoComplete="off"
          />
          <Mail size={16} color="#0147FF" style={{ flexShrink: 0 }} />
        </div>

        {/* Password */}
        <div>
          <div className="ag-wrap">
            <input
              type={showPw ? "text" : "password"}
              placeholder={t("auth", "form.passwordPlaceholder") || "Password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyPress={onKey}
              disabled={isLoading}
              className="ag-inp"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="ag-icon-btn"
              onClick={() => setShowPw(p => !p)}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password && (
            <div>
              <div className="ag-strength-row">
                {[1,2,3,4].map(i => (
                  <div
                    key={i}
                    className="ag-strength-seg"
                    style={{ background: strength.score >= i ? strength.color : "rgba(255,255,255,0.08)" }}
                  />
                ))}
              </div>
              <p className="ag-strength-lbl" style={{ color: strength.color }}>{strengthLabel}</p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <div className="ag-wrap">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder={t("auth", "form.confirmPasswordPlaceholder") || "Confirm Password"}
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
          {confirmPw && password !== confirmPw && (
            <p style={{ fontFamily: "'Syne',sans-serif", fontSize: "12px", color: "#f87171", marginTop: "6px", paddingLeft: "8px" }}>
              {t("auth", "form.errors.passwordMismatch") || "Passwords do not match"}
            </p>
          )}
        </div>

        {error && (
          <div className="ag-err">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <p style={{ textAlign: "center", fontFamily: "'Syne',sans-serif", fontSize: "12px", color: "var(--text-3)", lineHeight: 1.65 }}>
          {t("auth", "register.terms.prefix") || "By signing up, you agree to our"}{" "}
          <a href="/terms" style={{ color: "#0147FF", textDecoration: "none", fontWeight: 600 }}>
            {t("auth", "register.terms.tos") || "Terms of Service"}
          </a>
          {" " + (t("auth", "register.terms.and") || "and") + " "}
          <a href="/privacy" style={{ color: "#0147FF", textDecoration: "none", fontWeight: 600 }}>
            {t("auth", "register.terms.privacy") || "Privacy Policy"}
          </a>
        </p>
      </div>

      <div className="ag-form">
        <button className="ag-btn" onClick={handleSubmit} disabled={isLoading}>
          {isLoading
            ? <>
                <span className="ag-spinner" />
                {t("auth", "register.creating") || "Creating Account…"}
              </>
            : t("auth", "register.create") || "Create Account"
          }
        </button>
        {onSwitchToLogin && (
          <p style={{ textAlign: "center", fontFamily: "'Syne',sans-serif", fontSize: "13px", color: "var(--text-3)" }}>
            {t("auth", "register.hasAccount") || "Already have an account?"}{" "}
            <button className="ag-link" onClick={onSwitchToLogin} disabled={isLoading}>
              {t("auth", "register.signIn") || "Sign in"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}