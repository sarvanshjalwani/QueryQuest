import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [profileRecord, setProfileRecord] = useState(null);
  const [loadedProfileUserId, setLoadedProfileUserId] = useState(null);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error("Unable to restore Supabase session:", error);
      setSession(data?.session ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) {
      return;
    }

    let active = true;
    supabase
      .from("profiles")
      .select("id, display_name, editor_theme, editor_font_size, created_at")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Unable to load profile:", error);
        } else {
          setProfileRecord(data);
        }
        setLoadedProfileUserId(session.user.id);
      });

    return () => {
      active = false;
    };
  }, [session]);

  const profile = profileRecord?.id === session?.user?.id ? profileRecord : null;
  const profileLoading = Boolean(session?.user && loadedProfileUserId !== session.user.id);

  const value = useMemo(() => ({
    user: session?.user ?? null,
    session,
    profile,
    authLoading,
    profileLoading,
    isSupabaseConfigured,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signUp(email, password, displayName) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) throw error;
      return data;
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    async updateProfile(updates) {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id)
        .select("id, display_name, editor_theme, editor_font_size, created_at")
        .single();
      if (error) throw error;
      setProfileRecord(data);
      return data;
    },
  }), [session, profile, authLoading, profileLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
