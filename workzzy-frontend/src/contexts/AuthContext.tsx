import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabaseClient";

interface User {
  id: string;
  email: string | undefined;
  user_metadata: {
    role?: string;
    name?: string;
    [key: string]: any;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: Error, errorMessage: string) => {
    const error = err instanceof Error ? err.message : errorMessage;
    setError(error);
    console.error("Auth Error:", error);
    return Promise.reject(error);
  };

  useEffect(() => {
    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Update user state with session data
        setUser({
          id: session.user.id,
          email: session.user.email ?? undefined,
          user_metadata: {
            ...session.user.user_metadata,
            role: (session.user.user_metadata?.role || "worker").toLowerCase(),
          },
        });
      } else {
        // Clear user state when signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("Login result:", { error }); // Debug logging
      if (error) throw error;
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });
      console.log("Registration result:", { error }); // Debug logging
      if (error) throw error;
    } catch (err) {
      console.log("AuthContext - Current user state:", user);
      console.log("AuthContext - User metadata:", user?.user_metadata);
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
      setLoading(false);
      return Promise.resolve();
    } catch (err) {
      return handleError(err as Error, "Logout failed");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
