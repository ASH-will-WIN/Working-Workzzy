import {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabaseClient";

interface User {
  id: string;
  email?: string;
  user_metadata: {
    name?: string;
    role?: "hirer" | "worker";
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: "hirer" | "worker"
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Restore session from localStorage
    const storedSession = localStorage.getItem("supabase.auth.token");
    if (storedSession) {
      supabase.auth.setSession(JSON.parse(storedSession));
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      localStorage.setItem("supabase.auth.token", JSON.stringify(session));
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? undefined,
              user_metadata: session.user.user_metadata,
            }
          : null
      );
      setLoading(false);
    });

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(
          session?.user
            ? {
                id: session.user.id,
                email: session.user.email ?? undefined,
                user_metadata: session.user.user_metadata,
              }
            : null
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get session");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    localStorage.setItem(
      "supabase.auth.token",
      JSON.stringify(supabase.auth.getSession())
    );
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser({
        id: data.user.id,
        email: data.user.email ?? undefined,
        user_metadata: data.user.user_metadata,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: "hirer" | "worker"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });
      if (error) throw error;
      setUser(
        data.user
          ? {
              id: data.user.id,
              email: data.user.email ?? undefined,
              user_metadata: {
                ...data.user.user_metadata,
                role: data.user.user_metadata?.role || "worker",
              },
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
