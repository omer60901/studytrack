import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Bot, CalendarDays, CheckSquare, Clock, GraduationCap, LayoutDashboard, LogOut, Settings, Trophy, User } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";

const nav = [
  ["dashboard", "/", LayoutDashboard],
  ["tasks", "/tasks", CheckSquare],
  ["subjects", "/subjects", BookOpen],
  ["calendar", "/calendar", CalendarDays],
  ["exams", "/exams", GraduationCap],
  ["analytics", "/analytics", BarChart3],
  ["focus", "/focus", Clock],
  ["planner", "/planner", Bot],
  ["profile", "/profile", User],
  ["settings", "/settings", Settings]
];

const mobileNav = nav.slice(0, 5);

export default function Layout() {
  const { setToken, setUser, language, user } = useApp();
  const t = useT(language);
  const navigate = useNavigate();

  function logout() {
    setToken(null);
    setUser(null);
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#080a12] text-white light:bg-slate-50 light:text-slate-950">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(124,58,237,.28),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,.22),transparent_26%)]" />
      <aside className="fixed inset-y-0 hidden w-72 border-e border-white/10 bg-black/25 p-4 backdrop-blur-xl light:border-slate-200 light:bg-white lg:block">
        <Link to="/" className="mb-8 flex items-center gap-3 px-2">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-500"><Trophy size={22} /></span>
          <span>
            <strong className="block text-xl">{t.app}</strong>
            <span className="text-xs text-slate-400">{t.subtitle}</span>
          </span>
        </Link>
        <nav className="space-y-1">
          {nav.map(([key, path, Icon]) => (
            <NavLink key={key} to={path} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 light:text-slate-600 light:hover:bg-slate-100"}`}>
              <Icon size={18} />
              {t[key]}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="pb-24 lg:pb-0 lg:ps-72">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#080a12]/80 px-4 py-3 backdrop-blur-xl light:border-slate-200 light:bg-white/80 lg:px-8">
          <div>
            <p className="text-sm text-slate-400">{t.subtitle}</p>
            <h1 className="text-xl font-black">{t.app}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-400 sm:inline">{user?.username || "Demo Student"}</span>
            <button className="btn-soft" onClick={logout}><LogOut size={16} />{t.logout}</button>
          </div>
        </header>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mx-auto max-w-7xl p-4 lg:p-8">
          <Outlet />
        </motion.div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-white/10 bg-[#080a12]/95 p-2 backdrop-blur-xl light:border-slate-200 light:bg-white/95 lg:hidden">
        {mobileNav.map(([key, path, Icon]) => (
          <NavLink key={key} to={path} className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-bold ${isActive ? "bg-white text-slate-950 light:bg-slate-900 light:text-white" : "text-slate-400"}`}>
            <Icon size={18} />
            <span className="max-w-full truncate">{t[key]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
