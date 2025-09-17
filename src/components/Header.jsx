// src/components/Header.jsx
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../pages/Auth/AuthContext";
import { supabase } from "../supabaseClient"; // ggf. Pfad anpassen

export default function Header() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const firstname =
    user?.user_metadata?.firstname || user?.user_metadata?.firstName || "";
  const lastname =
    user?.user_metadata?.lastname || user?.user_metadata?.lastName || "";
  const displayName =
    [firstname, lastname].filter(Boolean).join(" ") || user?.email || "Profil";

  const isVerwaltung = location.pathname.startsWith("/verwaltung");

  // ---- Darkmode (global .dark auf <html>) ----
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // ---- Dropdowns ----
  const [openProfile, setOpenProfile] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const profileRef = useRef(null);
  const adminRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setOpenProfile(false);
      if (adminRef.current && !adminRef.current.contains(e.target))
        setOpenAdmin(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const linkBase =
    "px-3 py-2 rounded-lg transition hover:bg-neutral-100 dark:hover:bg-neutral-900 dark:text-white";
  const linkActive = "font-bold";
  const headerWrap =
    "sticky top-0 z-50 border-b border-neutral-200/70 dark:border-neutral-800/70 bg-white/90 dark:bg-black backdrop-blur text-neutral-900 dark:text-white";

  async function doLogout() {
    try {
      if (logout) await logout();
      if (supabase?.auth?.signOut) await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className={headerWrap}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo + Brand */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/images/logo-tsvbayer04.png" // liegt in public/images/
            alt="TSV Bayer Leverkusen"
            className="h-8 w-auto"
          />
          <span className="font-extrabold tracking-tight text-lg">
            TSV&nbsp;Bayer&nbsp;Leverkusen
          </span>
        </Link>

        {/* Navigation (Aktuelles links vom Chat) */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/aktuelles"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
          >
            Aktuelles
          </NavLink>
          <NavLink
            to="/chat"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
          >
            Chat
          </NavLink>

          {/* Verwaltung mit Dropdown */}
          <div className="relative" ref={adminRef}>
            <button
              onClick={() => setOpenAdmin((v) => !v)}
              className={`${linkBase} inline-flex items-center gap-1 ${isVerwaltung ? linkActive : ""}`}
            >
              Verwaltung <ChevronDown className="h-4 w-4 opacity-70" />
            </button>

            {openAdmin && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shadow-lg overflow-hidden text-neutral-900 dark:text-white">
                <NavLink
                  to="/verwaltung/gruppen"
                  onClick={() => setOpenAdmin(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 ${isActive ? "font-semibold" : ""}`
                  }
                >
                  Gruppen
                </NavLink>
                <NavLink
                  to="/verwaltung/mitglieder"
                  onClick={() => setOpenAdmin(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 ${isActive ? "font-semibold" : ""}`
                  }
                >
                  Mitglieder
                </NavLink>
                <NavLink
                  to="/verwaltung/news"
                  onClick={() => setOpenAdmin(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 ${isActive ? "font-semibold" : ""}`
                  }
                >
                  News
                </NavLink>
                <NavLink
                  to="/verwaltung/umfragen"
                  onClick={() => setOpenAdmin(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 ${isActive ? "font-semibold" : ""}`
                  }
                >
                  Umfragen
                </NavLink>
                <NavLink
                  to="/verwaltung/termine"
                  onClick={() => setOpenAdmin(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 ${isActive ? "font-semibold" : ""}`
                  }
                >
                  Termine
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* rechte Controls */}
        <div className="flex items-center gap-2">
          {/* Darkmode */}
          <button
            aria-label="Theme umschalten"
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900"
            title={theme === "dark" ? "Hellmodus" : "Dunkelmodus"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-white" />
            ) : (
              <Moon className="h-5 w-5 text-neutral-900" />
            )}
          </button>

          {/* Profil-Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setOpenProfile((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 transition text-neutral-900 dark:text-white"
            >
              <UserIcon className="h-4 w-4" />
              <span className="max-w-[160px] truncate">
                {loading ? "…" : displayName}
              </span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </button>

            {openProfile && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shadow-lg overflow-hidden text-neutral-900 dark:text-white">
                <Link
                  to="/profileinstellungen"
                  onClick={() => setOpenProfile(false)}
                  className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  Profileinstellungen
                </Link>

                <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

                <button
                  className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2"
                  onClick={doLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
