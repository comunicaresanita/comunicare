import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  role: "paziente" | "professionista";
  first_name: string;
  last_name: string;
  email: string;
  address?: string;
  bio?: string;
  numero_opi?: string;
  numero_fnofi?: string;
  partita_iva?: string;
  lat?: number;
  lng?: number;
  zona?: string;
  photo_url?: string;
  verified?: boolean;
  professional_type?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: Record<string, string>) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  const handleInactivityLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
    localStorage.removeItem("comunicare_remember");
    navigate("/");
  }, [navigate]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (user) {
      inactivityTimer.current = setTimeout(handleInactivityLogout, INACTIVITY_TIMEOUT);
    }
  }, [user, handleInactivityLogout]);

  // Set up inactivity listeners
  useEffect(() => {
    if (!user) {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      return;
    }

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    const handler = () => resetInactivityTimer();

    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetInactivityTimer(); // start timer

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [user, resetInactivityTimer]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data as Profile | null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 500);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getPublicOrigin = () => {
    const origin = window.location.origin;
    // If on internal sandbox domain, use the public preview URL
    if (origin.includes('.lovableproject.com')) {
      const projectId = origin.match(/^https?:\/\/([^.]+)/)?.[1];
      if (projectId) return `https://id-preview--${projectId}.lovable.app`;
    }
    return origin;
  };

  const signUp = async (email: string, password: string, metadata: Record<string, string>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${getPublicOrigin()}/auth/callback`,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getPublicOrigin()}/reset-password`,
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, resetPassword, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
