// src/components/HeaderLite.jsx
import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Moon, Sun, ChevronDown } from "lucide-react";

export default function HeaderLite() {
  // darkmode (persistiert)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // verwaltung dropdown (nur ui – keine auth nötig)
  const [openAdmin, setOpenAdmin] = useState(false);
  const adminRef = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      if (adminRef.current && !adminRef.current.contains(e.target)) setOpenAdmin(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const linkBase =
    "px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition";
  const headerWrap =
    "sticky top-0 z-50 border-b border-neutral-200/70 dark:border-neutral-800/70 bg-white/90 dark:bg-neutral-950/90 backdrop-blur";

  return (
    <header className={headerWrap}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo + Brand (Bild liegt in public/images/) */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo-tsvbayer04.png" alt="TSV Bayer Leverkusen" className="h-8 w-auto" />
          <span className="font-extrabold tracking-tight text-lg">
            TSV&nbsp;Bayer&nbsp;Leverkusen
          </span>
        </Link>

        {/* Nav – Aktuelles links vom Chat */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/aktuelles" className={linkBase}>Aktuelles</NavLink>
          <NavLink to="/chat" className={linkBase}>Chat</NavLink>

          <div className="relative" ref={adminRef}>
            <button
              onClick={() => setOpenAdmin((v) => !v)}
              className={`${linkBase} inline-flex items-center gap-1`}
            >
              Verwaltung <ChevronDown className="h-4 w-4 opacity-70" />
            </button>
            {openAdmin && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
                <NavLink to="/verwaltung/gruppen" className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => setOpenAdmin(false)}>Gruppen</NavLink>
                <NavLink to="/verwaltung/mitglieder" className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => setOpenAdmin(false)}>Mitglieder</NavLink>
                <NavLink to="/verwaltung/news" className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => setOpenAdmin(false)}>News</NavLink>
                <NavLink to="/verwaltung/umfragen" className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => setOpenAdmin(false)}>Umfragen</NavLink>
                <NavLink to="/verwaltung/termine" className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => setOpenAdmin(false)}>Termine</NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* rechts: darkmode + einfache links */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Theme umschalten"
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title={theme === "dark" ? "Hellmodus" : "Dunkelmodus"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <NavLink to="/profileinstellungen" className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">Profil</NavLink>
          <NavLink to="/login" className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">Login</NavLink>
        </div>
      </div>
    </header>
  );
}
