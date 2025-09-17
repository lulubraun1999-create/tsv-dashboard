// src/pages/Auth/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; // <- liegt bei dir direkt unter src/

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initiale Session + Listener
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      try {
        subscription?.subscription?.unsubscribe?.();
      } catch {}
    };
  }, []);

  // --- Auth-APIs ---
  async function login({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function register({ email, password, firstname, lastname }) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstname, lastname }, // im user_metadata speichern
      },
    });
    if (error) throw error;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function sendPasswordReset(email) {
    const redirectTo = `${window.location.origin}/update-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    sendPasswordReset,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
