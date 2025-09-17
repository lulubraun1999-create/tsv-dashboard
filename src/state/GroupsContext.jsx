// src/state/GroupsContext.jsx
import { createContext, useContext, useMemo, useState } from "react";

/** Startdaten (kannst du später aus Supabase laden) */
const INITIAL_TREE = {
  Herren: ["Herren 1", "Herren 2", "Herren 3"],
  Damen: ["Damen 1"],
  Mixed: ["Mixed 1"],
  Jugend: [
    "U8",
    "U10",
    "U12m",
    "U12w",
    "U14m",
    "U14w",
    "U16m",
    "U16w",
    "U18m",
    "U18w",
  ],
  Senioren: ["Ü30w", "Ü35m", "Ü45m", "Ü55m", "Ü60m"],
};

/** Natürliche Sortierung: Zahlen als Zahlen behandeln (U8 < U10) */
function naturalSort(list) {
  return [...list].sort((a, b) => {
    const re = /(\d+)/;
    const am = a.match(re);
    const bm = b.match(re);
    if (am && bm) {
      const an = parseInt(am[1], 10);
      const bn = parseInt(bm[1], 10);
      if (an !== bn) return an - bn;
    }
    return a.localeCompare(b, undefined, { sensitivity: "base" });
  });
}

/** Gesamten Baum sortieren */
function sortTree(obj) {
  const next = { ...obj };
  for (const k of Object.keys(next)) next[k] = naturalSort(next[k] || []);
  return next;
}

const GroupsContext = createContext(null);

export function GroupsProvider({ children }) {
  const [groupTree, setGroupTree] = useState(() => sortTree(INITIAL_TREE));

  const categories = useMemo(() => Object.keys(groupTree), [groupTree]);

  function addSubgroup(parentCat, name) {
    setGroupTree((prev) => {
      const next = { ...prev };
      const list = [...(next[parentCat] || []), name];
      next[parentCat] = naturalSort(list);
      return next;
    });
  }

  function renameSubgroup(parentCat, oldName, newName) {
    setGroupTree((prev) => {
      const next = { ...prev };
      const list = [...(next[parentCat] || [])];
      const idx = list.findIndex((g) => g === oldName);
      if (idx >= 0) list[idx] = newName;
      next[parentCat] = naturalSort(list);
      return next;
    });
  }

  function deleteSubgroup(parentCat, name) {
    setGroupTree((prev) => {
      const next = { ...prev };
      next[parentCat] = (next[parentCat] || []).filter((g) => g !== name);
      return next;
    });
  }

  const value = {
    groupTree,
    categories,
    addSubgroup,
    renameSubgroup,
    deleteSubgroup,
    naturalSort,
  };

  return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>;
}

export function useGroups() {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error("useGroups must be used inside <GroupsProvider>");
  return ctx;
}
