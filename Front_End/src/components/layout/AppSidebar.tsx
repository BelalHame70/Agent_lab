"use client"

import {
  useEffect, useState, useCallback, useRef, type ReactNode,
} from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Plus, Bot, ChevronLeft, ChevronRight, LogOut, Trash2,
  User, Headphones, BookOpen, BarChart2, Settings,
  HelpCircle, Menu, X,
} from "lucide-react"
import { getAgents, type Agent } from "@/lib/api"
import { useAuthStore } from "@/lib/useAuthStore"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"
import Link from "next/link"

const statusDot: Record<string, string> = {
  ready:      "bg-emerald-400",
  processing: "bg-amber-400 animate-pulse",
  idle:       "bg-white/20",
  failed:     "bg-red-500",
}

const AgentIcon = ({ type, active }: { type: string; active: boolean }) => {
  const map: Record<string, ReactNode> = {
    customer_support: <Headphones size={14} />,
    knowledge_base:   <BookOpen   size={14} />,
    analysis:         <BarChart2  size={14} />,
  }
  return (
    <span className={cn("shrink-0 transition-colors duration-150", active ? "text-[#0147FF]" : "text-white/30 group-hover/item:text-white/70")}>
      {map[type] ?? <Bot size={14} />}
    </span>
  )
}

function SidebarContent({
  collapsed, toggleCollapse, onClose, isMobile,
}: {
  collapsed: boolean
  toggleCollapse: (v: boolean) => void
  onClose?: () => void
  isMobile?: boolean
}) {
  const router   = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const { user, logout, deleteAccount } = useAuthStore()

  const [agents, setAgents]                   = useState<Agent[]>([])
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  const fetchAgents = useCallback(async () => {
    try {
      const data = await getAgents()
      setAgents(data)
    } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchAgents() }, [pathname, fetchAgents])

  useEffect(() => {
    const onOut = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node))
        setShowAccountMenu(false)
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setShowAccountMenu(false) }
    document.addEventListener("mousedown", onOut)
    document.addEventListener("keydown", onEsc)
    return () => { document.removeEventListener("mousedown", onOut); document.removeEventListener("keydown", onEsc) }
  }, [])

  const navigate = (path: string) => { router.push(path); onClose?.() }

  const handleLogout = async () => {
    setShowAccountMenu(false)
    await logout()
    router.push("/login")
  }

  const handleDeleteAccount = async () => {
    setShowAccountMenu(false)
    if (!window.confirm("Are you sure? This cannot be undone.")) return
    try { await deleteAccount(); router.push("/login") } catch { /* handled in store */ }
  }

  const isCollapsed = collapsed && !isMobile

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className={cn("h-[60px] flex items-center justify-between shrink-0 border-b border-white/[0.07]", isCollapsed ? "px-0 justify-center" : "px-4")}>
        {isCollapsed ? (
          <button onClick={() => toggleCollapse(false)} className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"><ChevronRight size={15} /></button>
        ) : (
          <>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(1,71,255,0.12)", border: "1px solid rgba(1,71,255,0.2)" }}>
                <Bot size={14} style={{ color: "#0147FF" }} />
              </div>
              <span className="text-[15px] tracking-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)" }}>AgentLab</span>
            </Link>
            {isMobile
              ? <button onClick={onClose} className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"><X size={15} /></button>
              : <button onClick={() => toggleCollapse(true)} className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"><ChevronLeft size={14} /></button>
            }
          </>
        )}
      </header>

      {/* New Agent */}
      <div className={cn("pt-4 pb-2 shrink-0", isCollapsed ? "px-2" : "px-3")}>
        <button
          onClick={() => navigate("/dashboard?newAgent=true")}
          className={cn("w-full flex items-center gap-2 rounded-xl text-[13px] transition-all duration-200 hover:-translate-y-0.5", isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5")}
          style={{ fontFamily: "var(--font-body)", fontWeight: 700, background: "#0147FF", color: "#fff", border: "1px solid rgba(1,71,255,0.4)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#1a5cff"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(1,71,255,0.35)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "#0147FF"; e.currentTarget.style.boxShadow = "none" }}
        >
          <Plus size={15} />
          {!isCollapsed && t("sidebar", "newAgent")}
        </button>
      </div>

      {/* Agents Label */}
      {!isCollapsed && (
        <p className="shrink-0 text-[11px] font-bold uppercase" style={{ padding: "16px 18px 8px", letterSpacing: "0.1em", color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
          {t("sidebar", "agents")} ({agents.length})
        </p>
      )}

      {/* Agents List */}
      <div className={cn("flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-white/10", isCollapsed ? "px-2" : "px-3")}>
        {!isCollapsed && agents.length === 0 && (
          <div className="px-3 py-10 text-center">
            <Bot size={18} className="mx-auto mb-2" style={{ color: "var(--text-faint)" }} />
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>{t("sidebar", "noAgents")}</p>
          </div>
        )}
        {agents.map((agent) => {
          const isActive = pathname === `/dashboard/agents/${agent.agent_id}`
          return (
            <button
              key={agent.agent_id}
              onClick={() => navigate(`/dashboard/agents/${agent.agent_id}`)}
              title={agent.name}
              className={cn("w-full flex items-center gap-2.5 rounded-xl text-left text-[13.5px] group/item transition-colors duration-150", isCollapsed ? "justify-center p-3" : "px-3 py-[9px]")}
              style={isActive
                ? { background: "rgba(1,71,255,0.12)", color: "#0147FF", border: "1px solid rgba(1,71,255,0.2)", fontFamily: "var(--font-body)", fontWeight: 600 }
                : { background: "transparent", color: "var(--text-subtle)", border: "1px solid transparent", fontFamily: "var(--font-body)", fontWeight: 500 }
              }
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)" }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent" }}
            >
              <AgentIcon type={agent.agent_type} active={isActive} />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1">{agent.name}</span>
                  <span className={cn("w-[7px] h-[7px] rounded-full shrink-0", statusDot[agent.ai_status])} />
                </>
              )}
            </button>
          )
        })}
      </div>

      <div className="shrink-0 mx-3 h-px" style={{ background: "var(--border)" }} />

      {/* Footer */}
      {!isCollapsed && (
        <div className="shrink-0 px-3 py-3">
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] transition-colors duration-150"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--text-subtle)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--white)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-subtle)" }}
          >
            <HelpCircle size={14} />
            {t("sidebar", "helpDocs")}
          </button>
        </div>
      )}

      {/* Account */}
      <div ref={accountMenuRef} className="shrink-0 p-3 relative" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          onClick={() => setShowAccountMenu(p => !p)}
          className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors duration-150", isCollapsed && "justify-center")}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <User size={13} style={{ color: "var(--text-subtle)" }} />
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-[13.5px] truncate" style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--white)" }}>
                {user?.name || t("sidebar", "account")}
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--text-faint)" }}>
                {user?.email || `${agents.length} agents`}
              </p>
            </div>
          )}
        </button>

        {showAccountMenu && (
          <div
            className={cn("absolute bottom-full mb-1.5 rounded-2xl overflow-hidden z-50", isCollapsed ? "left-full ml-2 w-48" : "left-3 right-3")}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
          >
            <button
              onClick={() => { setShowAccountMenu(false); router.push("/dashboard/settings") }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] transition-colors"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--text-subtle)", borderBottom: "1px solid var(--border)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--white)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-subtle)" }}
            >
              <Settings size={13} />{t("sidebar", "settings")}
            </button>


          </div>
        )}
      </div>
    </div>
  )
}

export default function AppSidebar() {
  const [mounted,    setMounted]    = useState(false)
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    if (localStorage.getItem("sidebar_collapsed") === "true") setCollapsed(true)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const toggleCollapse = (v: boolean) => { setCollapsed(v); localStorage.setItem("sidebar_collapsed", String(v)) }

  if (!mounted) return null

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-xl text-white/50 hover:text-white transition-colors" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <Menu size={16} />
      </button>
      {mobileOpen && <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("md:hidden fixed top-0 left-0 z-50 h-full w-[280px] flex flex-col transition-transform duration-300 ease-out border-r border-white/[0.07]", mobileOpen ? "translate-x-0" : "-translate-x-full")} style={{ background: "var(--card)" }}>
        <SidebarContent collapsed={false} toggleCollapse={toggleCollapse} onClose={() => setMobileOpen(false)} isMobile={true} />
      </aside>
      <aside className={cn("hidden md:flex relative shrink-0 h-screen flex-col transition-all duration-250 ease-out border-r border-white/[0.07]", collapsed ? "w-[60px]" : "w-[260px]")} style={{ background: "var(--card)" }}>
        <SidebarContent collapsed={collapsed} toggleCollapse={toggleCollapse} isMobile={false} />
      </aside>
    </>
  )
}