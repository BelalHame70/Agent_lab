"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import SetNewPasswordForm from "@/components/auth/SetNewPasswordForm";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

type AuthMode = "login" | "register" | "reset" | "set-password";

// ─── Grid background ────────────────────────────────────────────────────────
const GridBg = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage:
        "linear-gradient(rgba(1,71,255,0.05) 1px,transparent 1px)," +
        "linear-gradient(90deg,rgba(1,71,255,0.05) 1px,transparent 1px)",
      backgroundSize: "60px 60px",
    }} />
    <div style={{
      position: "absolute", inset: 0,
      background:
        "radial-gradient(ellipse 80% 70% at 85% 110%,rgba(1,71,255,0.18) 0%,transparent 60%)," +
        "radial-gradient(ellipse 50% 40% at 5%   5%, rgba(1,71,255,0.07) 0%,transparent 55%)",
    }} />
  </div>
);

const BrandPanel = ({ mode, compact, t }: { mode: AuthMode; compact?: boolean; t: (section: string, key: string) => string }) => {
  const taglines: Record<AuthMode, { title: string; sub: string }> = {
    login: {
      title: t("auth", "taglines.login.title") || "Welcome back.",
      sub: t("auth", "taglines.login.sub") || "Your AI agents are waiting. Sign in to manage, monitor, and deploy."
    },
    register: {
      title: t("auth", "taglines.register.title") || "Start building.",
      sub: t("auth", "taglines.register.sub") || "Create your account and launch your first AI agent in under 5 minutes."
    },
    reset: {
      title: t("auth", "taglines.reset.title") || "No worries.",
      sub: t("auth", "taglines.reset.sub") || "We'll send a reset link to your inbox. You'll be back in seconds."
    },
    "set-password": {
      title: t("auth", "taglines.set-password.title") || "Set your new password.",
      sub: t("auth", "taglines.set-password.sub") || "Your new password must be at least 8 characters long and include a mix of letters and numbers."
    }
  };

  const { title, sub } = taglines[mode];

  const stats = [
    { val: t("auth", "stats.0.val") || "5 min", label: t("auth", "stats.0.label") || "To first agent" },
    { val: t("auth", "stats.1.val") || "50+", label: t("auth", "stats.1.label") || "Languages" },
    { val: t("auth", "stats.2.val") || "24/7", label: t("auth", "stats.2.label") || "Uptime" },
  ];

  return (
    <div style={{
      position: "relative",
      width: compact ? "100%" : "420px",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: compact ? "32px 32px 28px" : "52px",
      overflow: "hidden",
      minHeight: compact ? "auto" : undefined,
      background: "var(--black)",
    }}>
      <GridBg />

      {/* Logo */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{
          display: "inline-block",
          width: "8px", height: "8px",
          borderRadius: "50%",
          background: "#0147FF",
          boxShadow: "0 0 12px #0147FF",
          animation: "agPulse 2.5s ease-in-out infinite",
        }} />
        <Link href="/">
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "21px", letterSpacing: "-0.4px", color: "var(--text-1)" }}>
            AgentLab
          </span>
        </Link>
      </div>

      {/* Tagline */}
      <div style={{ position: "relative", zIndex: 1, marginTop: compact ? "24px" : "0" }}>
        <h2 key={title} style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 600,
          fontSize: compact ? "36px" : "40px", lineHeight: 1.0, letterSpacing: "-2px",
          color: "var(--text-1)", margin: "0 0 14px",
          animation: "agFadeUp 0.4s cubic-bezier(.16,1,.3,1) both",
        }}>
          {title}
        </h2>

        <p key={sub} style={{
          fontFamily: "'Syne',sans-serif", fontSize: "15px",
          lineHeight: 1.65, color: "var(--text-3)",
          maxWidth: compact ? "100%" : "300px", margin: 0,
          animation: "agFadeUp 0.4s cubic-bezier(.16,1,.3,1) 0.07s both",
        }}>
          {sub}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", gap: compact ? "24px" : "32px",
        paddingTop: "28px", marginTop: compact ? "24px" : "0",
        borderTop: `1px solid var(--border)`,
      }}>
        {stats.map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: compact ? "18px" : "22px", letterSpacing: "-0.5px", color: "var(--text-1)", lineHeight: 1 }}>
              {s.val}
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "12px", color: "var(--text-3)", marginTop: "4px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Breakpoints ──────────────────────────────────────────────────────────────
type Layout = "mobile" | "tablet" | "desktop";

function getLayout(w: number): Layout {
  if (w >= 960) return "desktop";
  if (w >= 600) return "tablet";
  return "mobile";
}

// ─── Auth Layout ─────────────────────────────────────────────────────────────
export default function AuthLayout() {
  const searchParams        = useSearchParams();
  const router              = useRouter();
  const { t }               = useTranslation();
  const [mode, setMode]     = useState<AuthMode>("login");
  const [fading, setFading] = useState(false);
  const [layout, setLayout] = useState<Layout>("desktop");
  const formRef             = useRef<HTMLDivElement>(null);

  // Sync URL → state
  useEffect(() => {
    const p = searchParams.get("mode");
    if (p === "register" || p === "reset") setMode(p as AuthMode);
    else setMode("login");
  }, [searchParams]);

  // Responsive layout detection
  useEffect(() => {
    const check = () => setLayout(getLayout(window.innerWidth));
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Switch mode with fade
  const switchMode = (next: AuthMode) => {
    if (next === mode || fading) return;
    setFading(true);
    setTimeout(() => {
      setMode(next);
      router.replace(`/auth?mode=${next}`, { scroll: false });
      setFading(false);
    }, 200);
  };

  // Auto-focus first input after transition
  useEffect(() => {
    if (!fading) {
      setTimeout(() => {
        formRef.current
          ?.querySelector<HTMLInputElement>("input:not([type='hidden'])")
          ?.focus();
      }, 80);
    }
  }, [mode, fading]);

  const isDesktop = layout === "desktop";
  const isTablet  = layout === "tablet";
  const isMobile  = layout === "mobile";

  return (
    <>
      {/* ── Global styles ─────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes agPulse {
          0%,100% { opacity:1; transform:scale(1);    }
          50%      { opacity:.4; transform:scale(.75); }
        }
        @keyframes agFadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes agSpin   { to { transform:rotate(360deg); } }
        @keyframes agFill   { from { width:0% } to { width:100% } }

        .ag-wrap {
          display:flex; align-items:center; gap:10px;
          padding:13px 20px;
          border:1px solid var(--border);
          border-radius:100px;
          background:var(--input-bg);
          transition:border-color .2s, box-shadow .2s;
          width:100%;
        }
        .ag-wrap:focus-within {
          border-color:#0147FF !important;
          box-shadow:0 0 0 3px rgba(1,71,255,0.12);
        }
        .ag-inp {
          flex:1; min-width:0;
          background:transparent; border:none; outline:none;
          color:var(--text-1);
          font-family:'Syne',sans-serif;
          font-size:14px;
        }
        .ag-inp::placeholder { color:var(--text-3); }
        .ag-inp:disabled     { opacity:.4; }

        .ag-btn {
          width:100%;
          display:flex; align-items:center; justify-content:center; gap:8px;
          padding:14px 24px;
          border-radius:100px; border:none;
          background:linear-gradient(135deg,#0147FF 0%,#1a5cff 100%);
          color:#fff;
          font-family:'Syne',sans-serif; font-weight:600; font-size:14px;
          cursor:pointer;
          box-shadow:0 8px 26px rgba(1,71,255,0.35);
          transition:transform .2s, box-shadow .2s, opacity .2s;
          position:relative; overflow:hidden;
        }
        .ag-btn::after {
          content:''; position:absolute; inset:0; border-radius:inherit;
          background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 55%);
          pointer-events:none;
        }
        .ag-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 14px 38px rgba(1,71,255,0.45); }
        .ag-btn:disabled             { opacity:.5; cursor:not-allowed; box-shadow:none; }

        .ag-err {
          display:flex; align-items:center; gap:8px;
          padding:10px 14px; border-radius:14px;
          background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2);
          color:#f87171;
          font-family:'Syne',sans-serif; font-size:13px; line-height:1.5;
          animation:agFadeUp .3s ease both;
        }
        .ag-ok {
          display:flex; align-items:center; gap:8px;
          padding:10px 14px; border-radius:14px;
          background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2);
          color:#4ade80;
          font-family:'Syne',sans-serif; font-size:13px;
          animation:agFadeUp .3s ease both;
        }
        .ag-pill {
          display:inline-flex; align-items:center; gap:7px;
          padding:5px 14px; border-radius:100px;
          background:rgba(1,71,255,0.08); border:1px solid rgba(1,71,255,0.2);
          color:#0147FF;
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:10px; letter-spacing:3px; text-transform:uppercase;
          margin-bottom:14px;
        }
        .ag-pill-dot {
          width:5px; height:5px; border-radius:50%;
          background:#0147FF; display:inline-block;
          animation:agPulse 2s ease-in-out infinite;
        }
        .ag-h1 {
          font-family:'Syne',sans-serif; font-weight:800;
          font-size:34px; letter-spacing:-1.2px; line-height:1.1;
          color:var(--text-1); margin-bottom:6px;
        }
        .ag-sub {
          font-family:'Syne',sans-serif; font-size:14px;
          color:var(--text-3); line-height:1.6;
        }
        .ag-link {
          background:none; border:none; padding:0;
          font-family:'Syne',sans-serif; font-size:13px; font-weight:600;
          color:#0147FF; cursor:pointer; transition:color .2s;
        }
        .ag-link:hover { color:#4d80ff; }
        .ag-link:disabled { opacity:.4; cursor:not-allowed; }
        .ag-ghost {
          background:none; border:none; padding:0;
          font-family:'Syne',sans-serif; font-size:13px;
          color:var(--text-3); cursor:pointer; transition:color .2s;
          display:inline-flex; align-items:center; gap:6px;
        }
        .ag-ghost:hover { color:var(--text-1); }
        .ag-icon-btn {
          background:none; border:none; padding:0; cursor:pointer;
          color:var(--text-3); display:flex; align-items:center;
          transition:color .2s; flex-shrink:0;
        }
        .ag-icon-btn:hover { color:var(--text-1); }
        .ag-spinner {
          width:15px; height:15px; flex-shrink:0;
          border:2px solid rgba(255,255,255,0.2); border-top-color:#fff;
          border-radius:50%; display:inline-block;
          animation:agSpin .7s linear infinite;
        }
        .ag-strength-row { display:flex; gap:4px; margin-top:8px; padding:0 4px; }
        .ag-strength-seg { flex:1; height:3px; border-radius:3px; transition:background-color .35s; }
        .ag-strength-lbl { font-family:'Syne',sans-serif; font-size:11px; text-align:right; padding:0 4px; margin-top:3px; transition:color .3s; }
        .ag-form  { display:flex; flex-direction:column; gap:10px; }
        .ag-stack { display:flex; flex-direction:column; gap:22px; }
      `}</style>

      {/* ── Page root ──────────────────────────────────────────────── */}
      <div style={{
        minHeight: "100vh",
        background: "var(--black)",
        display: "flex",
        alignItems: isDesktop ? "center" : "flex-start",
        justifyContent: "center",
        padding: isDesktop ? "40px" : isMobile ? "16px" : "24px",
        fontFamily: "'Syne',sans-serif",
      }}>
        {/* Faint page-wide grid */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(1,71,255,0.02) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(1,71,255,0.02) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }} />

        {/* ── Card ─────────────────────────────────────────────────── */}
        <div style={{
          position: "relative", zIndex: 1,
          width: "100%",
          maxWidth: isDesktop ? "1040px" : isTablet ? "600px" : "100%",
          background: "var(--card)",
          borderRadius: isDesktop ? "44px" : isMobile ? "24px" : "32px",
          border: `1px solid var(--border)`,
          boxShadow: "0 40px 100px rgba(0,0,0,0.5),0 0 0 1px rgba(1,71,255,0.04)",
          display: "flex",
          flexDirection: isDesktop ? "row" : "column",
          overflow: "hidden",
          minHeight: isDesktop ? "580px" : "auto",
          marginTop: isDesktop ? "0" : "16px",
          marginBottom: isDesktop ? "0" : "16px",
        }}>

          {/* ── Brand panel ─────────────────────────────────────────── */}
          {isDesktop ? (
            <BrandPanel mode={mode} t={t} />
          ) : (
            <BrandPanel mode={mode} compact t={t} />
          )}

          {/* Divider */}
          <div style={{
            ...(isDesktop
              ? { width: "1px", alignSelf: "stretch" }
              : { height: "1px", width: "100%" }),
            background: "var(--border)",
            flexShrink: 0,
          }} />

          {/* ── Form panel ─────────────────────────────────────────── */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: isDesktop
              ? "52px 60px"
              : isTablet
              ? "40px 48px"
              : "32px 20px 40px",
            minWidth: 0,
            position: "relative",
            background: "var(--surface)",
          }}>
            {/* Form container */}
            <div
              ref={formRef}
              style={{
                width: "100%",
                maxWidth: isDesktop ? "340px" : isTablet ? "380px" : "100%",
                opacity: fading ? 0 : 1,
                transform: fading ? "translateY(10px)" : "translateY(0)",
                transition: "opacity .2s ease, transform .2s ease",
              }}
            >
              {mode === "login" && (
                <LoginForm
                  onSwitchToRegister={() => switchMode("register")}
                  onSwitchToReset={() => switchMode("reset")}
                />
              )}
              {mode === "register" && (
                <RegisterForm onSwitchToLogin={() => switchMode("login")} />
              )}
              {mode === "reset" && (
                <ResetPasswordForm onBackToLogin={() => switchMode("login")} />
              )}
              {mode === "set-password" && (
                <SetNewPasswordForm onBackToLogin={() => switchMode("login")} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}