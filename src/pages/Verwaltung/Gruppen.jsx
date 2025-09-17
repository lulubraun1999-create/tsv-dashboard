// src/pages/Verwaltung/Gruppen.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Users
} from "lucide-react";

/** Zahlbewusster String-Vergleich: "U8" < "U10" */
function numericAwareCompare(a, b) {
  const ax = a.match(/\d+/);
  const bx = b.match(/\d+/);
  if (ax && bx) {
    const na = parseInt(ax[0], 10);
    const nb = parseInt(bx[0], 10);
    if (na !== nb) return na - nb;
  }
  // fallback lexikalisch
  return a.localeCompare(b, "de", { sensitivity: "base", numeric: true });
}

export default function Gruppen() {
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParentId, setSelectedParentId] = useState(null);

  // Dialog/Form-States
  const [showAdd, setShowAdd] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [newName, setNewName] = useState("");
  const [renameId, setRenameId] = useState(null);
  const [renameName, setRenameName] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [feedback, setFeedback] = useState("");

  // Laden
  async function loadGroups() {
    setLoading(true);
    const { data, error } = await supabase
      .from("groups")
      .select("id,name,parent_id,created_at")
      .order("parent_id", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      setFeedback("Fehler beim Laden der Gruppen.");
    } else {
      setAllGroups(data ?? []);
      // Falls noch nichts ausgewählt: erste Obergruppe wählen
      if (!selectedParentId) {
        const firstParent = (data ?? []).find((g) => !g.parent_id);
        setSelectedParentId(firstParent?.id || null);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    loadGroups();

    // optional: Realtime-Refresh bei Änderungen
    const channel = supabase
      .channel("groups-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "groups" },
        () => loadGroups()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Abgeleitete Strukturen
  const parents = useMemo(
    () =>
      (allGroups.filter((g) => !g.parent_id) || []).sort((a, b) =>
        numericAwareCompare(a.name, b.name)
      ),
    [allGroups]
  );

  const currentParent = useMemo(
    () => allGroups.find((g) => g.id === selectedParentId) || null,
    [allGroups, selectedParentId]
  );

  const children = useMemo(
    () =>
      (allGroups.filter((g) => g.parent_id === selectedParentId) || []).sort(
        (a, b) => numericAwareCompare(a.name, b.name)
      ),
    [allGroups, selectedParentId]
  );

  // Aktionen
  async function handleAdd(e) {
    e?.preventDefault?.();
    if (!newName.trim()) return;

    // Wenn eine Obergruppe ausgewählt ist → Untergruppe anlegen
    // Wenn keine Obergruppe ausgewählt ist → Obergruppe anlegen
    const payload = {
      name: newName.trim(),
      parent_id: selectedParentId || null,
    };

    const { error } = await supabase.from("groups").insert(payload);
    if (error) {
      console.error(error);
      setFeedback("Konnte Gruppe nicht anlegen.");
    } else {
      setFeedback("Gruppe angelegt.");
      setNewName("");
      setShowAdd(false);
      loadGroups();
    }
  }

  function openRename(id, name) {
    setRenameId(id);
    setRenameName(name);
    setShowRename(true);
  }

  async function handleRename(e) {
    e?.preventDefault?.();
    if (!renameId || !renameName.trim()) return;

    const { error } = await supabase
      .from("groups")
      .update({ name: renameName.trim() })
      .eq("id", renameId);

    if (error) {
      console.error(error);
      setFeedback("Umbenennen fehlgeschlagen.");
    } else {
      setFeedback("Gruppe umbenannt.");
      setShowRename(false);
      setRenameId(null);
      setRenameName("");
      loadGroups();
    }
  }

  function openDelete(id) {
    setDeleteId(id);
    setShowDelete(true);
  }

  async function handleDelete() {
    if (!deleteId) return;

    const { error } = await supabase.from("groups").delete().eq("id", deleteId);
    if (error) {
      console.error(error);
      setFeedback(
        "Löschen fehlgeschlagen. Hat die Gruppe noch Untergruppen? (ON DELETE CASCADE erforderlich)."
      );
    } else {
      setFeedback("Gruppe gelöscht.");
      setShowDelete(false);
      // Falls die gelöschte Obergruppe ausgewählt war, Auswahl zurücksetzen
      if (deleteId === selectedParentId) {
        setSelectedParentId(null);
      }
      setDeleteId(null);
      loadGroups();
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 text-neutral-900 dark:text-white">
      {/* Kopfzeile */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">
          TSV Bayer Leverkusen – Gruppen
        </h1>
        <div className="flex items-center gap-2 text-sm opacity-70">
          <Users className="h-4 w-4" />
          Verwaltung / Gruppen
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="mb-4 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-sm">
          {feedback}
        </div>
      )}

      {/* Grid: Links Obergruppen, Rechts Untergruppen + Aktionen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Linke Spalte: Obergruppen */}
        <aside className="lg:col-span-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 font-semibold">
              Obergruppen
            </div>
            <div className="p-2">
              {loading ? (
                <div className="px-3 py-2 text-sm opacity-70">Lade…</div>
              ) : parents.length === 0 ? (
                <div className="px-3 py-2 text-sm opacity-70">
                  Keine Obergruppen vorhanden.
                </div>
              ) : (
                <ul className="flex flex-col">
                  {parents.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => setSelectedParentId(p.id)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 ${
                          selectedParentId === p.id
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                            : ""
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Aktionen für Obergruppe anlegen */}
            <div className="px-3 py-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => {
                  setSelectedParentId(null); // Obergruppe kontext
                  setNewName("");
                  setShowAdd(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black px-3 py-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Obergruppe hinzufügen
              </button>
            </div>
          </div>
        </aside>

        {/* Rechte Spalte: Untergruppen der ausgewählten Obergruppe */}
        <main className="lg:col-span-8">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="font-semibold">
                {currentParent ? (
                  <>Untergruppen von <span className="font-bold">{currentParent.name}</span></>
                ) : (
                  <>Bitte eine Obergruppe auswählen</>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Untergruppe hinzufügen */}
                <button
                  disabled={!currentParent}
                  onClick={() => {
                    setNewName("");
                    setShowAdd(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title={currentParent ? "Untergruppe hinzufügen" : "Erst Obergruppe wählen"}
                >
                  <Plus className="h-4 w-4" />
                  Untergruppe hinzufügen
                </button>

                {/* Umbenennen */}
                <button
                  disabled={!currentParent}
                  onClick={() => {
                    if (!currentParent) return;
                    openRename(currentParent.id, currentParent.name);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title={currentParent ? "Obergruppe umbenennen" : "Erst Obergruppe wählen"}
                >
                  <Pencil className="h-4 w-4" />
                  Obergruppe umbenennen
                </button>

                {/* Löschen */}
                <button
                  disabled={!currentParent}
                  onClick={() => currentParent && openDelete(currentParent.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-300 text-rose-700 dark:text-rose-400 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title={currentParent ? "Obergruppe löschen" : "Erst Obergruppe wählen"}
                >
                  <Trash2 className="h-4 w-4" />
                  Obergruppe löschen
                </button>
              </div>
            </div>

            {/* Liste Untergruppen */}
            <div className="p-3">
              {loading ? (
                <div className="px-3 py-2 text-sm opacity-70">Lade…</div>
              ) : !currentParent ? (
                <div className="px-3 py-2 text-sm opacity-70">Keine Auswahl.</div>
              ) : children.length === 0 ? (
                <div className="px-3 py-2 text-sm opacity-70">
                  Keine Untergruppen vorhanden.
                </div>
              ) : (
                <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {children.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <div className="truncate">{c.name}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openRename(c.id, c.name)}
                          className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-xs"
                        >
                          <Pencil className="h-3 w-3" />
                          Umbenennen
                        </button>
                        <button
                          onClick={() => openDelete(c.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-300 text-rose-700 dark:text-rose-400 px-2 py-1 text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                          Löschen
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Dialog: Hinzufügen */}
      {showAdd && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdd(false)} />
          <form
            onSubmit={handleAdd}
            className="relative w-full max-w-md rounded-xl bg-white dark:bg-black p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold mb-3">
              {selectedParentId ? "Untergruppe hinzufügen" : "Obergruppe hinzufügen"}
            </h3>
            <label className="grid gap-1">
              <span className="text-sm opacity-80">Name</span>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black"
                placeholder={selectedParentId ? "z. B. Herren 1" : "z. B. Herren"}
                required
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-neutral-900 text-white hover:opacity-90 dark:bg-white dark:text-black"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dialog: Umbenennen */}
      {showRename && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRename(false)} />
          <form
            onSubmit={handleRename}
            className="relative w-full max-w-md rounded-xl bg-white dark:bg-black p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold mb-3">Gruppe umbenennen</h3>
            <label className="grid gap-1">
              <span className="text-sm opacity-80">Neuer Name</span>
              <input
                autoFocus
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black"
                required
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRename(false)}
                className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-neutral-900 text-white hover:opacity-90 dark:bg-white dark:text-black"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dialog: Löschen */}
      {showDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDelete(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-black p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-3 text-rose-600">Gruppe löschen?</h3>
            <p className="opacity-80">
              Diese Aktion kann nicht rückgängig gemacht werden.
              {deleteId === selectedParentId
                ? " Es wird eine Obergruppe gelöscht (alle Untergruppen müssen vorher entfernt sein oder die DB braucht ON DELETE CASCADE)."
                : " Es wird eine Untergruppe gelöscht."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              >
                Endgültig löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
