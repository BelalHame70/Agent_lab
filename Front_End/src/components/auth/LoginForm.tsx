"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useTranslation } from "@/hooks/useTranslation";

interface Props {
  onSwitchToRegister?: () => void;
  onSwitchToReset?: () => void;
}

export default function LoginForm({ onSwitchToRegister, onSwitchToReset }: Props) {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { t } = useTranslation();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");

  const quickValidate = (): string | null => {
    if (!email || !password)          return t("auth", "form.errors.fillAll") || "Please fill in all fields";
    if (!/\S+@\S+\.\S+/.test(email)) return t("auth", "form.errors.invalidEmail") || "Please enter a valid email address";
    if (password.length < 6)          return t("auth", "form.errors.passwordMin") || "Password must be at least 6 characters";
    return null;
  };

  const handleSubmit = async () => {
    const err = quickValidate();
    if (err) { setError(err); return; }
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("auth", "form.errors.loginFailed") || "Login failed. Please try again.");
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) handleSubmit();
  };

  return (
    <div className="ag-stack" style={{ animation: "agFadeUp .45s cubic-bezier(.16,1,.3,1) both" }}>
      <div>
        <h1 className="ag-h1">{t("auth", "login.title") || "Welcome Home"}</h1>
        <p className="ag-sub">{t("auth", "login.subtitle") || "Sign in to your account to continue"}</p>
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
            autoComplete="email"
          />
          <Mail size={16} color="#0147FF" style={{ flexShrink: 0 }} />
        </div>

        <div className="ag-wrap">
          <input
            type={showPw ? "text" : "password"}
            placeholder={t("auth", "form.passwordPlaceholder") || "Password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyPress={onKey}
            disabled={isLoading}
            className="ag-inp"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="ag-icon-btn"
            onClick={() => setShowPw(p => !p)}
            aria-label={showPw ? "Hide" : "Show"}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <div className="ag-err">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {onSwitchToReset && (
          <div style={{ textAlign: "right" }}>
            <button
              className="ag-ghost"
              style={{ fontSize: "12px" }}
              onClick={onSwitchToReset}
              disabled={isLoading}
            >
              {t("auth", "login.forgotPassword") || "Forgot password?"}
            </button>
          </div>
        )}
      </div>

      <div className="ag-form">
        <button className="ag-btn" onClick={handleSubmit} disabled={isLoading}>
          {isLoading
            ? <>
                <span className="ag-spinner" />
                {t("auth", "login.signingIn") || "Signing in…"}
              </>
            : t("auth", "login.signIn") || "Sign In"
          }
        </button>
        {onSwitchToRegister && (
          <p style={{ textAlign: "center", fontFamily: "'Syne',sans-serif", fontSize: "13px", color: "var(--text-3)" }}>
            {t("auth", "login.noAccount") || "Don't have an account?"}{" "}
            <button className="ag-link" onClick={onSwitchToRegister} disabled={isLoading}>
              {t("auth", "login.createOne") || "Create one"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}