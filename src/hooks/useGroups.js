import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("parent_id", { ascending: true })
        .order("sort_key", { ascending: true })
        .order("name", { ascending: true });

      if (!ignore) {
        if (error) console.error(error);
        setGroups(data ?? []);
        setLoading(false);
      }
    }

    load();

    const sub = supabase
      .channel("groups-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "groups" }, load)
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(sub);
    };
  }, []);

  return { groups, loading, setGroups };
}
