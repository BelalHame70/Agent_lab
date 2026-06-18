"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Sun, Moon, Globe, Check, Eye, EyeOff, Loader2, X } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { useAuthStore } from "@/lib/useAuthStore"

// ── Delete Account Modal ─────────────────────────────────────────
function DeleteAccountModal({
  onClose,
  onConfirm,
  isLoading,
  userEmail,
}: {
  onClose: () => void
  onConfirm: (email: string, password: string) => Promise<void>
  isLoading: boolean
  userEmail: string
}) {
  const { t } = useTranslation()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState("")

  const handleConfirm = async () => {
    setError("")
    if (!email || !password) {
      setError(t("settings", "delete.errors.fillAll") || "Please fill in all fields")
      return
    }
    if (email !== userEmail) {
      setError(t("settings", "delete.errors.emailMismatch") || "Email doesn't match your account email")
      return
    }
    try {
      await onConfirm(email, password)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("settings", "delete.errors.somethingWrong") || "Something went wrong")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !isLoading && onClose()}
      />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: "var(--text-3)" }}
        >
          <X size={16} />
        </button>
        <div className="mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>
          <h2 className="text-sm font-semibold mb-1" style={{ color: "var(--text-1)" }}>
            {t("settings", "delete.title") || "Delete Account"}
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
            {t("settings", "delete.warning.prefix") || "This action is"}{" "}
            <span style={{ color: "#DC2626", fontWeight: 600 }}>
              {t("settings", "delete.warning.permanent") || "permanent"}
            </span>{" "}
            {t("settings", "delete.warning.suffix") || "and cannot be undone. All your agents, files, and data will be deleted."}
          </p>
        </div>
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
              {t("settings", "delete.confirmEmail") || "Confirm your email"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={userEmail}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "10px",
                border: "1px solid var(--border)", background: "var(--surface)",
                color: "var(--text-1)", fontSize: "13px", outline: "none", boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(220,38,38,0.4)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
              {t("settings", "delete.confirmPassword") || "Confirm your password"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                style={{
                  width: "100%", padding: "10px 40px 10px 12px", borderRadius: "10px",
                  border: "1px solid var(--border)", background: "var(--surface)",
                  color: "var(--text-1)", fontSize: "13px", outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(220,38,38,0.4)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
              />
              <button
                onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {error && <p className="text-xs" style={{ color: "#f87171" }}>⚠ {error}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl py-2.5 text-xs font-semibold transition-colors"
            style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", cursor: "pointer" }}
          >
            {t("settings", "delete.cancel") || "Cancel"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !email || !password}
            className="flex-1 rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            style={{
              background: email && password && !isLoading ? "#DC2626" : "rgba(220,38,38,0.3)",
              color: "#fff", border: "none",
              cursor: email && password && !isLoading ? "pointer" : "not-allowed",
            }}
          >
            {isLoading && <Loader2 size={12} className="animate-spin" />}
            {t("settings", "delete.confirm") || "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { t, locale, changeLocale, isRTL } = useTranslation()

  const {
    user, isLoading, error: storeError,
    updateName, changePassword, requestEmailChange,
    logout, deleteAccount,
  } = useAuthStore()

  const [isEditingProfile, setIsEditingProfile]   = useState(false)
  const [isEditingEmail, setIsEditingEmail]       = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [showPassword, setShowPassword]           = useState(false)
  const [showNewPassword, setShowNewPassword]     = useState(false)
  const [showDeleteModal, setShowDeleteModal]     = useState(false)

  const [tempName, setTempName]   = useState("")
  const [tempEmail, setTempEmail] = useState("")
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" })

  // ── Local error/success state (replaces _setError) ──────────
  const [passwordError, setPasswordError] = useState("")
  const [successMsg, setSuccessMsg]       = useState("")

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(""), 3000)
  }

  useEffect(() => {
    setMounted(true)
    if (user) { setTempName(user.name); setTempEmail(user.email) }
  }, [user])

  const handleSaveName = async () => {
    try {
      await updateName(tempName)
      setIsEditingProfile(false)
      showSuccess(t("settings", "success.nameUpdated") || "Name updated successfully")
    } catch {}
  }

  const handleSaveEmail = async () => {
    try {
      await requestEmailChange(tempEmail)
      setIsEditingEmail(false)
      showSuccess(t("settings", "success.verificationSent") || "Verification link sent to new email")
    } catch {}
  }

  const handleSavePassword = async () => {
    // Validate locally — no need to touch the store
    setPasswordError("")
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError(t("settings", "password.errors.mismatch") || "Passwords do not match")
      return
    }
    if (passwordData.new.length < 6) {
      setPasswordError(t("settings", "password.errors.tooShort") || "Password must be at least 6 characters")
      return
    }
    try {
      await changePassword(passwordData.current, passwordData.new)
      setPasswordData({ current: "", new: "", confirm: "" })
      setIsEditingPassword(false)
      setPasswordError("")
      showSuccess(t("settings", "success.passwordUpdated") || "Password updated successfully")
    } catch (e: unknown) {
      // Show server error (e.g. "Wrong current password") inline
      setPasswordError(e instanceof Error ? e.message : "Failed to update password")
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/auth")
  }

  const handleDeleteConfirm = async (_email: string, _password: string) => {
    await deleteAccount()
    router.push("/auth")
  }

  const LANGUAGES = [
    { code: "en", label: t("settings", "languages.english.label") || "English", native: t("settings", "languages.english.native") || "English" },
    { code: "ar", label: t("settings", "languages.arabic.label") || "Arabic",  native: t("settings", "languages.arabic.native")  || "العربية" },
  ]

  if (!mounted) return null

  return (
    <>
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          isLoading={isLoading}
          userEmail={user?.email ?? ""}
        />
      )}

      <div className="w-full min-h-screen" style={{ padding: "32px 48px", background: "var(--black)" }}>
        <div style={{ maxWidth: "680px" }} className="space-y-12">

          {/* Header */}
          <div>
            <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "32px", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-1px" }}>
              {t("settings", "title") || "Settings"}
            </h1>
            <p style={{ fontFamily: "var(--font-arabic)", fontSize: "15px", color: "var(--text-3)", marginTop: "8px" }}>
              {t("settings", "subtitle") || "Manage your account settings and preferences"}
            </p>
          </div>

          {/* Store-level error (network / server errors) */}
          {storeError && (
            <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: "13px" }}>
              ⚠ {storeError}
            </div>
          )}

          {/* Success toast */}
          {successMsg && (
            <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", fontSize: "13px" }}>
              ✓ {successMsg}
            </div>
          )}

          {/* ── Profile ─────────────────────────────────────────── */}
          <section className="space-y-4">
            <div>
              <p style={{ fontFamily: "var(--font-syne)", fontSize: "14px", fontWeight: 700, color: "var(--text-1)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {t("settings", "sections.profile.title") || "Profile"}
              </p>
              <p style={{ fontFamily: "var(--font-arabic)", fontSize: "13px", color: "var(--text-3)", marginTop: "4px" }}>
                {t("settings", "sections.profile.subtitle") || "Update your personal information"}
              </p>
            </div>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
              {/* Name */}
              <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexDirection: isRTL ? "row-reverse" : "row" }}>
                  <label style={{ fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 600, color: "var(--text-2)" }}>
                    {t("settings", "profile.fullName") || "Full Name"}
                  </label>
                  {!isEditingProfile && (
                    <button onClick={() => setIsEditingProfile(true)} style={{ fontSize: "12px", fontWeight: 600, color: "#0147FF", background: "none", border: "none", cursor: "pointer" }}>
                      {t("settings", "profile.edit") || "Edit"}
                    </button>
                  )}
                </div>
                {isEditingProfile ? (
                  <div style={{ display: "flex", gap: "8px", flexDirection: isRTL ? "row-reverse" : "row" }}>
                    <input
                      type="text" value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: "14px", outline: "none" }}
                    />
                    <button onClick={handleSaveName} disabled={isLoading}
                      style={{ padding: "8px 16px", borderRadius: "8px", background: "#0147FF", color: "#fff", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                      {isLoading && <Loader2 size={12} className="animate-spin" />}
                      {t("settings", "profile.save") || "Save"}
                    </button>
                    <button onClick={() => { setIsEditingProfile(false); setTempName(user?.name ?? "") }}
                      style={{ padding: "8px 12px", borderRadius: "8px", background: "var(--surface)", color: "var(--text-3)", fontSize: "12px", border: "1px solid var(--border)", cursor: "pointer" }}>
                      {t("settings", "profile.cancel") || "Cancel"}
                    </button>
                  </div>
                ) : (
                  <p style={{ fontFamily: "var(--font-arabic)", fontSize: "14px", color: "var(--text-1)" }}>{user?.name || "—"}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexDirection: isRTL ? "row-reverse" : "row" }}>
                  <label style={{ fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 600, color: "var(--text-2)" }}>
                    {t("settings", "profile.email") || "Email Address"}
                  </label>
                  {!isEditingEmail && (
                    <button onClick={() => setIsEditingEmail(true)} style={{ fontSize: "12px", fontWeight: 600, color: "#0147FF", background: "none", border: "none", cursor: "pointer" }}>
                      {t("settings", "profile.change") || "Change"}
                    </button>
                  )}
                </div>
                {isEditingEmail ? (
                  <div>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexDirection: isRTL ? "row-reverse" : "row" }}>
                      <input
                        type="email" value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: "14px", outline: "none" }}
                      />
                      <button onClick={handleSaveEmail} disabled={isLoading}
                        style={{ padding: "8px 16px", borderRadius: "8px", background: "#0147FF", color: "#fff", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                        {isLoading && <Loader2 size={12} className="animate-spin" />}
                        {t("settings", "profile.send") || "Send"}
                      </button>
                      <button onClick={() => { setIsEditingEmail(false); setTempEmail(user?.email ?? "") }}
                        style={{ padding: "8px 12px", borderRadius: "8px", background: "var(--surface)", color: "var(--text-3)", fontSize: "12px", border: "1px solid var(--border)", cursor: "pointer" }}>
                        {t("settings", "profile.cancel") || "Cancel"}
                      </button>
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--text-3)" }}>
                      ℹ {t("settings", "profile.verificationNote") || "A verification link will be sent to the new email"}
                    </p>
                  </div>
                ) : (
                  <p style={{ fontFamily: "var(--font-arabic)", fontSize: "14px", color: "var(--text-1)" }}>{user?.email || "—"}</p>
                )}
              </div>
            </div>
          </section>

          <div style={{ height: "1px", background: "var(--border)" }} />

          {/* ── Password ─────────────────────────────────────────── */}
          <section className="space-y-4">
            <div>
              <p style={{ fontFamily: "var(--font-syne)", fontSize: "14px", fontWeight: 700, color: "var(--text-1)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {t("settings", "sections.password.title") || "Password & Security"}
              </p>
            </div>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
              {!isEditingPassword ? (
                <button
                  onClick={() => setIsEditingPassword(true)}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  {t("settings", "password.change") || "Change Password"}
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label style={{ fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: "8px" }}>
                      {t("settings", "password.current") || "Current Password"}
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        style={{ width: "100%", padding: "10px 40px 10px 12px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                      />
                      <button onClick={() => setShowPassword(!showPassword)}
                        style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: "8px" }}>
                      {t("settings", "password.new") || "New Password"}
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                        style={{ width: "100%", padding: "10px 40px 10px 12px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                      />
                      <button onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}>
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: "8px" }}>
                      {t("settings", "password.confirm") || "Confirm Password"}
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleSavePassword()}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Password-specific error (local state, not store) */}
                  {passwordError && (
                    <p style={{ fontSize: "12px", color: "#f87171", padding: "8px 12px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      ⚠ {passwordError}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: "10px", flexDirection: isRTL ? "row-reverse" : "row" }}>
                    <button onClick={handleSavePassword} disabled={isLoading}
                      style={{ flex: 1, padding: "12px 16px", borderRadius: "10px", background: "#0147FF", color: "#fff", fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      {isLoading && <Loader2 size={14} className="animate-spin" />}
                      {t("settings", "password.update") || "Update Password"}
                    </button>
                    <button
                      onClick={() => { setIsEditingPassword(false); setPasswordData({ current: "", new: "", confirm: "" }); setPasswordError("") }}
                      style={{ flex: 1, padding: "12px 16px", borderRadius: "10px", background: "var(--surface)", color: "var(--text-1)", fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 600, border: "1px solid var(--border)", cursor: "pointer" }}>
                      {t("settings", "password.cancel") || "Cancel"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div style={{ height: "1px", background: "var(--border)" }} />

          {/* ── Appearance ───────────────────────────────────────── */}
          <section className="space-y-4">
            <div>
              <p style={{ fontFamily: "var(--font-syne)", fontSize: "14px", fontWeight: 700, color: "var(--text-1)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {t("settings", "appearance.title") || "Appearance"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "dark",  label: t("settings", "appearance.dark")  || "Dark",  icon: <Moon size={16} /> },
                { value: "light", label: t("settings", "appearance.light") || "Light", icon: <Sun  size={16} /> },
              ].map((opt) => {
                const isActive = theme === opt.value
                return (
                  <button key={opt.value} onClick={() => setTheme(opt.value)}
                    style={{ background: isActive ? "rgba(1,71,255,0.08)" : "var(--card)", border: `1px solid ${isActive ? "rgba(1,71,255,0.3)" : "var(--border)"}`, borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: isActive ? "rgba(1,71,255,0.15)" : "var(--surface)", border: `1px solid ${isActive ? "rgba(1,71,255,0.25)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? "#0147FF" : "var(--text-3)" }}>{opt.icon}</div>
                      <span style={{ fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 700, color: isActive ? "var(--text-1)" : "var(--text-2)" }}>{opt.label}</span>
                    </div>
                    {isActive && <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#0147FF", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={11} color="#fff" /></div>}
                  </button>
                )
              })}
            </div>
          </section>

          <div style={{ height: "1px", background: "var(--border)" }} />

          {/* ── Language ─────────────────────────────────────────── */}
          <section className="space-y-4">
            <div>
              <p style={{ fontFamily: "var(--font-syne)", fontSize: "14px", fontWeight: 700, color: "var(--text-1)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {t("settings", "language.title") || "Language"}
              </p>
            </div>
            <div className="space-y-2">
              {LANGUAGES.map((lang) => {
                const isActive = locale === lang.code
                return (
                  <button key={lang.code} onClick={() => changeLocale(lang.code as "en" | "ar")}
                    style={{ width: "100%", background: isActive ? "rgba(1,71,255,0.08)" : "var(--card)", border: `1px solid ${isActive ? "rgba(1,71,255,0.3)" : "var(--border)"}`, borderRadius: "14px", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", flexDirection: isRTL ? "row-reverse" : "row" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexDirection: isRTL ? "row-reverse" : "row" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: isActive ? "rgba(1,71,255,0.15)" : "var(--surface)", border: `1px solid ${isActive ? "rgba(1,71,255,0.25)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? "#0147FF" : "var(--text-3)" }}><Globe size={14} /></div>
                      <div style={{ textAlign: isRTL ? "right" : "left" }}>
                        <p style={{ fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 700, color: isActive ? "var(--text-1)" : "var(--text-2)" }}>{lang.label}</p>
                        <p style={{ fontFamily: "var(--font-arabic)", fontSize: "11px", color: "var(--text-3)", marginTop: "1px" }}>{lang.native}</p>
                      </div>
                    </div>
                    {isActive && <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#0147FF", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={11} color="#fff" /></div>}
                  </button>
                )
              })}
            </div>
          </section>

          <div style={{ height: "1px", background: "var(--border)" }} />

          {/* ── Danger Zone ──────────────────────────────────────── */}
          <section className="space-y-4">
            <div className="space-y-2">
              <button onClick={handleLogout} disabled={isLoading}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 600, cursor: "pointer", flexDirection: isRTL ? "row-reverse" : "row" }}>
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                )}
                <span>{t("settings", "dangerZone.logout") || "Logout"}</span>
              </button>

              <button onClick={() => setShowDeleteModal(true)} disabled={isLoading}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", borderRadius: "14px", border: "1px solid #DC2626", background: "rgba(220,38,38,0.08)", color: "#DC2626", fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 600, cursor: "pointer", flexDirection: isRTL ? "row-reverse" : "row" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                <span>{t("settings", "dangerZone.deleteAccount") || "Delete Account"}</span>
              </button>
            </div>
          </section>

          <div style={{ height: "40px" }} />
        </div>
      </div>
    </>
  )
}