// src/pages/Profileinstellungen.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // ggf. Pfad anpassen
import { useAuth } from "./Auth/AuthContext"; // ggf. Pfad anpassen
import { useGroups } from "../state/GroupsContext"; // liefert groupTree + categories
import {
  User,
  Mail,
  KeyRound,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// Menü-Konstanten
const Menu = {
  DATA: "data",
  EMAIL: "email",
  PASSWORD: "password",
  LOGOUT: "logout",
  DELETE: "delete",
};

export default function Profileinstellungen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { groupTree, categories } = useGroups();

  // aktiver Menüpunkt
  const [active, setActive] = useState(Menu.DATA);

  // --- Basisdaten ---
  const [firstname, setFirstname] = useState(user?.user_metadata?.firstname || "");
  const [lastname, setLastname] = useState(user?.user_metadata?.lastname || "");
  const [phone, setPhone] = useState(user?.user_metadata?.phone || "");
  const [city, setCity] = useState(user?.user_metadata?.city || "");

  // --- Gruppen-Auswahl (synchron zu Verwaltung/Gruppen) ---
  const initialSelected = useMemo(() => {
    const arr = user?.user_metadata?.groups || []; // ["Herren|Herren 1", ...]
    return new Set(arr);
  }, [user]);
  const [selected, setSelected] = useState(initialSelected);
  useEffect(() => setSelected(initialSelected), [initialSelected]);

  const keyFor = (cat, sub) => `${cat}|${sub}`;
  const toggleGroup = (cat, sub) => {
    const k = keyFor(cat, sub);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  // --- Email ändern ---
  const [email1, setEmail1] = useState("");
  const [email2, setEmail2] = useState("");
  const [emailMsg, setEmailMsg] = useState("");

  // --- Passwort ändern ---
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  // --- Konto löschen ---
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");

  // --- Speichern: Profil + Gruppen ---
  async function handleSaveProfile(e) {
    e.preventDefault();
    try {
      await supabase.auth.updateUser({
        data: {
          firstname,
          lastname,
          phone,
          city,
          groups: Array.from(selected),
        },
      });
      alert("Profil gespeichert.");
    } catch (err) {
      console.error(err);
      alert("Speichern fehlgeschlagen.");
    }
  }

  // --- Email ändern ---
  async function handleChangeEmail(e) {
    e.preventDefault();
    setEmailMsg("");
    if (!email1 || !email2 || email1.trim() !== email2.trim()) {
      setEmailMsg("Die E-Mail-Adressen stimmen nicht überein.");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ email: email1.trim() });
      if (error) throw error;
      setEmailMsg("Bestätigungs-Mail gesendet. Bitte Posteingang prüfen.");
    } catch (err) {
      console.error(err);
      setEmailMsg("E-Mail konnte nicht geändert werden.");
    }
  }

  // --- Passwort ändern ---
  async function handleChangePassword(e) {
    e.preventDefault();
    setPwMsg("");
    if (!pw1 || !pw2 || pw1 !== pw2) {
      setPwMsg("Die Passwörter stimmen nicht überein.");
      return;
    }
    if (pw1.length < 8) {
      setPwMsg("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      setPwMsg("Passwort aktualisiert.");
      setPw1("");
      setPw2("");
    } catch (err) {
      console.error(err);
      setPwMsg("Passwort konnte nicht geändert werden.");
    }
  }

  // --- Logout ---
  async function handleLogout() {
    try {
      if (logout) await logout();
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    } finally {
      navigate("/login", { replace: true });
    }
  }

  // --- Konto löschen (Edge Function) ---
  async function handleDeleteAccount() {
    setDeleteMsg("");
    try {
      // 1) Access Token holen
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Kein Login-Token gefunden. Bitte neu einloggen.");

      // 2) Edge Functions Basis-URL aus CRA-ENV
      const base = process.env.REACT_APP_SUPABASE_URL;
      if (!base) throw new Error("REACT_APP_SUPABASE_URL fehlt in .env");

      // 3) Aufruf mit Bearer-Token
      const res = await fetch(`${base}/functions/v1/delete-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}), // Body optional
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      // Erfolgreich -> ausloggen & zur Login-Seite
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      setDeleteMsg(String(err?.message || err));
    } finally {
      setConfirmDelete(false);
    }
  }

  // UI helpers
  const menuBtn =
    "w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900";
  const isActive = (key) =>
    active === key ? "bg-neutral-900 text-white dark:bg-white dark:text-black" : "";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-neutral-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-6">Profileinstellungen</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Linkes Menü */}
        <aside className="lg:col-span-3">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2">
            <button className={`${menuBtn} ${isActive(Menu.DATA)}`} onClick={() => setActive(Menu.DATA)}>
              <User className="h-4 w-4" /> Daten ändern
            </button>
            <button className={`${menuBtn} ${isActive(Menu.EMAIL)}`} onClick={() => setActive(Menu.EMAIL)}>
              <Mail className="h-4 w-4" /> E-Mail ändern
            </button>
            <button className={`${menuBtn} ${isActive(Menu.PASSWORD)}`} onClick={() => setActive(Menu.PASSWORD)}>
              <KeyRound className="h-4 w-4" /> Passwort ändern
            </button>
            <div className="h-px my-2 bg-neutral-200 dark:bg-neutral-800" />
            <button className={`${menuBtn} ${isActive(Menu.LOGOUT)}`} onClick={() => setActive(Menu.LOGOUT)}>
              <LogOut className="h-4 w-4" /> Logout
            </button>
            <button className={`${menuBtn} ${isActive(Menu.DELETE)}`} onClick={() => setActive(Menu.DELETE)}>
              <Trash2 className="h-4 w-4" /> Konto löschen
            </button>
          </div>
        </aside>

        {/* Rechter Inhalt */}
        <main className="lg:col-span-9">
          {/* Daten ändern */}
          {active === Menu.DATA && (
            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Block: Basisdaten */}
              <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
                <h2 className="text-lg font-semibold mb-4">Daten ändern</h2>
                <div className="grid gap-4">
                  <label className="grid gap-1">
                    <span className="text-sm opacity-80">Vorname</span>
                    <input
                      className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm opacity-80">Nachname</span>
                    <input
                      className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm opacity-80">Telefon</span>
                    <input
                      className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm opacity-80">Wohnort</span>
                    <input
                      className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </label>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-neutral-900 text-white hover:opacity-90 dark:bg-white dark:text-black"
                  >
                    Speichern
                  </button>
                </div>
              </section>

              {/* Block: Gruppen-Auswahl */}
              <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
                <h2 className="text-lg font-semibold mb-4">Gruppen</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div key={cat} className="rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <div className="px-3 py-2 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                        {cat}
                      </div>
                      <div className="p-3 grid gap-2">
                        {(groupTree[cat] || []).map((sub) => {
                          const k = keyFor(cat, sub);
                          const checked = selected.has(k);
                          return (
                            <label key={k} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={checked}
                                onChange={() => toggleGroup(cat, sub)}
                              />
                              <span className="truncate">{sub}</span>
                            </label>
                          );
                        })}
                        {(groupTree[cat] || []).length === 0 && (
                          <div className="opacity-60 text-sm">Keine Untergruppen.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </form>
          )}

          {/* E-Mail ändern */}
          {active === Menu.EMAIL && (
            <form onSubmit={handleChangeEmail} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 max-w-xl">
              <h2 className="text-lg font-semibold mb-4">E-Mail ändern</h2>
              <div className="grid gap-4">
                <label className="grid gap-1">
                  <span className="text-sm opacity-80">Neue E-Mail</span>
                  <input
                    type="email"
                    value={email1}
                    onChange={(e) => setEmail1(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black"
                    required
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm opacity-80">E-Mail bestätigen</span>
                  <input
                    type="email"
                    value={email2}
                    onChange={(e) => setEmail2(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black"
                    required
                  />
                </label>

                {emailMsg && (
                  <p className={`text-sm ${emailMsg.includes("gesendet") ? "text-emerald-500" : "text-red-500"} flex items-center gap-1`}>
                    {emailMsg.includes("gesendet") ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    {emailMsg}
                  </p>
                )}

                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 rounded-lg bg-neutral-900 text-white hover:opacity-90 dark:bg-white dark:text-black">
                    Aktualisieren
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Passwort ändern */}
          {active === Menu.PASSWORD && (
            <form onSubmit={handleChangePassword} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 max-w-xl">
              <h2 className="text-lg font-semibold mb-4">Passwort ändern</h2>
              <div className="grid gap-4">
                <label className="grid gap-1">
                  <span className="text-sm opacity-80">Neues Passwort</span>
                  <input
                    type="password"
                    value={pw1}
                    onChange={(e) => setPw1(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black"
                    required
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm opacity-80">Passwort bestätigen</span>
                  <input
                    type="password"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black"
                    required
                  />
                </label>

                {pwMsg && (
                  <p className={`text-sm ${pwMsg.includes("aktualisiert") ? "text-emerald-500" : "text-red-500"} flex items-center gap-1`}>
                    {pwMsg.includes("aktualisiert") ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    {pwMsg}
                  </p>
                )}

                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 rounded-lg bg-neutral-900 text-white hover:opacity-90 dark:bg-white dark:text-black">
                    Aktualisieren
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Logout */}
          {active === Menu.LOGOUT && (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 max-w-xl">
              <h2 className="text-lg font-semibold mb-4">Logout</h2>
              <p className="mb-4 opacity-80">Du wirst abgemeldet und zur Login-Seite weitergeleitet.</p>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white hover:opacity-90 dark:bg-white dark:text-black"
              >
                <LogOut className="h-4 w-4" />
                Jetzt abmelden
              </button>
            </div>
          )}

          {/* Konto löschen */}
          {active === Menu.DELETE && (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 max-w-xl">
              <h2 className="text-lg font-semibold mb-4">Konto löschen</h2>
              <p className="mb-4 flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-4 w-4" />
                Diese Aktion ist dauerhaft. Alle Daten werden gelöscht.
              </p>

              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Konto endgültig löschen
              </button>

              {deleteMsg && <p className="mt-4 text-sm text-red-400">{deleteMsg}</p>}

              {/* Bestätigungsdialog */}
              {confirmDelete && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDelete(false)} />
                  <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-black p-6 shadow-xl">
                    <h3 className="text-lg font-semibold mb-3">Wirklich löschen?</h3>
                    <p className="opacity-80 mb-5">
                      Bitte bestätige, dass du dein Konto dauerhaft löschen möchtest.
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        Ja, Konto löschen
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
