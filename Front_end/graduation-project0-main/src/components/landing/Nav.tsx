"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/lib/useAuthStore";

function ArrowIcon() {
  return (
    <svg className="arrow-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="nav-signin" aria-label="Toggle dark mode">
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

export default function Nav() {
  const [scrolled, setScrolled]       = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { t } = useTranslation();
  const { accessToken } = useAuthStore();
  const isLoggedIn = !!accessToken;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileOpen(false);

  // لو logged in → dashboard، لو لأ → auth
  const signInHref    = isLoggedIn ? "/dashboard" : "/auth"
  const getStartedHref = isLoggedIn ? "/dashboard" : "/auth?mode=register"

  return (
    <>
      <nav className={scrolled ? "scrolled" : ""}>
        <Link href="/" className="nav-logo" onClick={closeMobileMenu}>
          <div className="nav-logo-dot" />
          AgentLab
        </Link>

        {/* Desktop Links */}
        <ul className="nav-links">
          <li><Link href="#features">{t("nav", "features") || "Features"}</Link></li>
          <li><Link href="#usecases">{t("nav", "useCases") || "Use Cases"}</Link></li>
          <li><Link href="#how">{t("nav", "howItWorks") || "How It Works"}</Link></li>
        </ul>

        {/* Desktop Right Actions */}
        <div className="nav-right">
          <ThemeToggle />
          <Link href={signInHref} className="nav-signin desktop-only" style={{ fontFamily: "var(--font-body)" }}>
            {isLoggedIn ? (t("nav", "dashboard") || "Dashboard") : (t("nav", "signIn") || "Sign In")}
          </Link>
          <Link
            href={getStartedHref}
            className="btn-primary desktop-only"
            style={{ padding: "12px 24px", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-body)" }}
          >
            {isLoggedIn ? (t("nav", "goToDashboard") || "Go to Dashboard") : (t("nav", "getStarted") || "Get Started")} <ArrowIcon />
          </Link>

          <button
            className={`nav-menu-btn ${isMobileOpen ? "open" : ""}`}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle mobile menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      <div className={`nav-mobile ${isMobileOpen ? "open" : ""}`}>
        <Link href="#features" onClick={closeMobileMenu}>{t("nav", "features") || "Features"}</Link>
        <Link href="#usecases" onClick={closeMobileMenu}>{t("nav", "useCases") || "Use Cases"}</Link>
        <Link href="#how" onClick={closeMobileMenu}>{t("nav", "howItWorks") || "How It Works"}</Link>

        <div className="nav-mobile-actions">
          <Link href={signInHref} className="nav-signin" onClick={closeMobileMenu} style={{ fontFamily: "var(--font-body)" }}>
            {isLoggedIn ? (t("nav", "dashboard") || "Dashboard") : (t("nav", "signIn") || "Sign In")}
          </Link>
          <Link
            href={getStartedHref}
            className="btn-primary"
            style={{ padding: "12px 24px", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center", width: "100%", fontFamily: "var(--font-body)" }}
            onClick={closeMobileMenu}
          >
            {isLoggedIn ? (t("nav", "goToDashboard") || "Go to Dashboard") : (t("nav", "getStarted") || "Get Started")} <ArrowIcon />
          </Link>
        </div>
      </div>
    </>
  );
}