"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/useAuthStore"
import { useTranslation } from "@/hooks/useTranslation"
import {
  Search, Trash2, Shield, Users, Bot,
  CheckCircle, XCircle, Loader2, X, AlertTriangle,
} from "lucide-react"

// Types
type AdminUser = {
  user_id: string
  name: string
  email: string
  verified: boolean
  role: "user" | "admin"
  agents_count: number
  created_at: string
}

// ── Mock Data 
const MOCK_USERS: AdminUser[] = [
  { user_id: "1", name: "Belal Hamed",   email: "belal@example.com",   verified: true,  role: "admin", agents_count: 5, created_at: "2024-01-15" },
  { user_id: "2", name: "Ahmed Mohamed", email: "ahmed@example.com",   verified: true,  role: "user",  agents_count: 3, created_at: "2024-02-20" },
  { user_id: "3", name: "Sara Ali",      email: "sara@example.com",    verified: true,  role: "user",  agents_count: 1, created_at: "2024-03-10" },
  { user_id: "4", name: "Omar Hassan",   email: "omar@example.com",    verified: false, role: "user",  agents_count: 0, created_at: "2024-04-05" },
  { user_id: "5", name: "Nour Ibrahim",  email: "nour@example.com",    verified: true,  role: "user",  agents_count: 7, created_at: "2024-04-18" },
  { user_id: "6", name: "Youssef Kamal", email: "youssef@example.com", verified: false, role: "user",  agents_count: 2, created_at: "2024-05-01" },
]

// ── Delete Confirm Modal 
function DeleteUserModal({
  user,
  onClose,
  onConfirm,
  isLoading,
  t,
  isRTL,
}: {
  user: AdminUser
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
  t: (section: string, key: string) => string
  isRTL: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isLoading && onClose()} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <button onClick={onClose} disabled={isLoading} className="absolute top-4 p-1 rounded-lg" style={{ [isRTL ? "left" : "right"]: "16px", color: "var(--text-3)" }}>
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-4" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)" }}>
            <AlertTriangle size={18} color="#DC2626" />
          </div>
          <div style={{ textAlign: isRTL ? "right" : "left" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
              {t("admin", "delete.title") || "Delete Account"}
            </h2>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              {t("admin", "delete.warning") || "This action cannot be undone"}
            </p>
          </div>
        </div>

        <div className="rounded-xl p-3 mb-5" style={{ background: "var(--surface)", border: "1px solid var(--border)", textAlign: isRTL ? "right" : "left" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-2)" }}>{user.name}</p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>{user.email}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
            {user.agents_count} {t("admin", "delete.agents") || "agent"}
            {user.agents_count !== 1 ? "s" : ""} {t("admin", "delete.willBeDeleted") || "will be deleted"}
          </p>
        </div>

        <div className="flex gap-2" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl py-2.5 text-xs font-semibold"
            style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", cursor: "pointer" }}
          >
            {t("admin", "delete.cancel") || "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
            style={{ background: "#DC2626", color: "#fff", border: "none", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading && <Loader2 size={12} className="animate-spin" />}
            {t("admin", "delete.confirm") || "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Stat Card 
function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  color: string 
}) {
  return (
    <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: "var(--text-1)", fontFamily: "var(--font-plus-jakarta)" }}>{value}</p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>{label}</p>
      </div>
    </div>
  )
}

// ── Main Page 
export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { t, isRTL } = useTranslation()

  const [users, setUsers]           = useState<AdminUser[]>([])
  const [filtered, setFiltered]     = useState<AdminUser[]>([])
  const [search, setSearch]         = useState("")
  const [loading, setLoading]       = useState(true)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Auth Guard 
  useEffect(() => {
    setLoading(false)
    setUsers(MOCK_USERS)
    setFiltered(MOCK_USERS)
  }, [])

  // ── Search 
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    )
  }, [search, users])

  // ── Delete 
  const handleDelete = async () => {
    if (!deletingUser) return
    setDeleteLoading(true)
    try {
      await new Promise(r => setTimeout(r, 800)) // mock delay
      setUsers(prev => prev.filter(u => u.user_id !== deletingUser.user_id))
      setDeletingUser(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Stats 
  const totalUsers    = users.length
  const totalAgents   = users.reduce((sum, u) => sum + u.agents_count, 0)
  const verifiedUsers = users.filter(u => u.verified).length

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "var(--black)" }}>
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-3)" }} />
      </div>
    )
  }

  return (
    <>
      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDelete}
          isLoading={deleteLoading}
          t={t}
          isRTL={isRTL}
        />
      )}

      <div className="min-h-screen p-6 md:p-8" style={{ background: "var(--black)" }}>
        <div className="max-w-6xl mx-auto space-y-8">

          {/* ── Header  */}
          <div className="flex items-center justify-between" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
            <div className="flex items-center gap-3" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(1,71,255,0.1)", border: "1px solid rgba(1,71,255,0.2)" }}>
                <Shield size={18} style={{ color: "#0147FF" }} />
              </div>
              <div style={{ textAlign: isRTL ? "right" : "left" }}>
                <h1 className="text-lg font-bold" style={{ color: "var(--text-1)", fontFamily: "var(--font-plus-jakarta)" }}>
                  {t("admin", "header.title") || "Admin Dashboard"}
                </h1>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  {t("admin", "header.subtitle") || "Manage all user accounts"}
                </p>
              </div>
            </div>

            {/* Mock badge */}
            <span className="text-xs px-3 py-1 rounded-full font-semibold shrink-0" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
              {t("admin", "header.mockData") || "Mock Data"}
            </span>
          </div>

          {/* ── Stats  */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard 
              icon={<Users size={18} />}       
              label={t("admin", "stats.totalUsers") || "Total Users"}      
              value={totalUsers}    
              color="#0147FF" 
            />
            <StatCard 
              icon={<Bot size={18} />}         
              label={t("admin", "stats.totalAgents") || "Total Agents"}     
              value={totalAgents}   
              color="#22c55e" 
            />
            <StatCard 
              icon={<CheckCircle size={18} />} 
              label={t("admin", "stats.verifiedUsers") || "Verified Users"}   
              value={verifiedUsers} 
              color="#a855f7" 
            />
          </div>

          {/* ── Search  */}
          <div className="relative">
            <Search size={15} className="absolute top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)", [isRTL ? "right" : "left"]: "14px" }} />
            <input
              type="text"
              placeholder={t("admin", "search.placeholder") || "Search by name or email..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", 
                padding: `11px 12px 11px ${isRTL ? "38px" : "38px"}`,
                borderRadius: "12px", 
                border: "1px solid var(--border)",
                background: "var(--card)", 
                color: "var(--text-1)",
                fontSize: "13px", 
                outline: "none", 
                boxSizing: "border-box",
                textAlign: isRTL ? "right" : "left",
                direction: isRTL ? "rtl" : "ltr",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "rgba(1,71,255,0.4)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            />
          </div>

          {/* ── Table  */}
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            {/* Table Header */}
            <div className="grid gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b"
              style={{
                gridTemplateColumns: "1fr 1.5fr 80px 60px 80px 50px",
                color: "var(--text-3)",
                borderColor: "var(--border)",
                background: "var(--surface)",
                direction: isRTL ? "rtl" : "ltr",
              }}
            >
              <span>{t("admin", "table.name") || "Name"}</span>
              <span>{t("admin", "table.email") || "Email"}</span>
              <span className="text-center">{t("admin", "table.agents") || "Agents"}</span>
              <span className="text-center">{t("admin", "table.verified") || "Verified"}</span>
              <span className="text-center">{t("admin", "table.role") || "Role"}</span>
              <span className="text-center">{t("admin", "table.action") || "Action"}</span>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Users size={24} className="mx-auto mb-3" style={{ color: "var(--text-3)" }} />
                <p className="text-sm" style={{ color: "var(--text-3)" }}>
                  {t("admin", "table.noUsers") || "No users found"}
                </p>
              </div>
            ) : (
              filtered.map((u, i) => (
                <div
                  key={u.user_id}
                  className="grid gap-4 px-5 py-4 items-center transition-colors"
                  style={{
                    gridTemplateColumns: "1fr 1.5fr 80px 60px 80px 50px",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                    direction: isRTL ? "rtl" : "ltr",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {/* Name */}
                  <div className="flex items-center gap-2.5 min-w-0" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: "rgba(1,71,255,0.1)", color: "#0147FF" }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium truncate" style={{ color: "var(--text-1)", fontFamily: "var(--font-plus-jakarta)" }}>
                      {u.name}
                    </span>
                  </div>

                  {/* Email */}
                  <span className="text-xs truncate" style={{ color: "var(--text-3)", textAlign: isRTL ? "right" : "left" }}>
                    {u.email}
                  </span>

                  {/* Agents Count */}
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ flexDirection: isRTL ? "row-reverse" : "row", background: "rgba(34,197,94,0.08)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                      <Bot size={10} />
                      {u.agents_count}
                    </span>
                  </div>

                  {/* Verified */}
                  <div className="flex justify-center">
                    {u.verified
                      ? <CheckCircle size={16} color="#22c55e" />
                      : <XCircle    size={16} color="#f87171" />
                    }
                  </div>

                  {/* Role */}
                  <div className="text-center">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={u.role === "admin"
                        ? { background: "rgba(1,71,255,0.1)", color: "#0147FF", border: "1px solid rgba(1,71,255,0.2)" }
                        : { background: "rgba(255,255,255,0.05)", color: "var(--text-3)", border: "1px solid var(--border)" }
                      }>
                      {t("admin", `table.roles.${u.role}`) || u.role}
                    </span>
                  </div>

                  {/* Delete */}
                  <div className="flex justify-center">
                    {u.role !== "admin" ? (
                      <button
                        onClick={() => setDeletingUser(u)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                        style={{ color: "var(--text-3)" }}
                        title={t("admin", "table.deleteTooltip") || "Delete user"}
                      >
                        <Trash2 size={14} className="hover:text-red-400" />
                      </button>
                    ) : (
                      <div className="p-1.5" style={{ color: "var(--text-3)", opacity: 0.3 }}>
                        <Shield size={14} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <p className="text-xs text-center" style={{ color: "var(--text-3)" }}>
            {t("admin", "footer.showing") || "Showing"} {filtered.length} {t("admin", "footer.of") || "of"} {totalUsers} {t("admin", "footer.users") || "users"}
          </p>

        </div>
      </div>
    </>
  )
}
