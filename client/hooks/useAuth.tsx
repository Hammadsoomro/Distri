import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthApi, clearToken, setToken } from "@/lib/api";
import type { PublicUser } from "@shared/api";

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminSetup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await AuthApi.me();
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async login(email, password) {
      const res = await AuthApi.login(email, password);
      setToken(res.token);
      setUser(res.user);
    },
    async adminSetup(name, email, password) {
      const res = await AuthApi.adminSetup(name, email, password);
      setToken(res.token);
      setUser(res.user);
    },
    logout() {
      clearToken();
      setUser(null);
    },
    async refresh() {
      const u = await AuthApi.me();
      setUser(u);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
