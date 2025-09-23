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
    let mounted = true;
    (async () => {
      try {
        const u = await AuthApi.me();
        if (mounted) setUser(u);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Request notification permission early
    try {
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "default"
      ) {
        Notification.requestPermission().catch(() => {});
      }
    } catch {}

    return () => {
      mounted = false;
    };
  }, []);

  // Poll inbox for notifications
  useEffect(() => {
    let t: any;
    let lastCount = 0;
    const beepSrc =
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAZGF0YQAAAAA="; // tiny silent/beep placeholder
    const audio = new Audio(beepSrc);
    async function poll() {
      try {
        const res = await (await import("@/lib/api")).InboxApi.get();
        const inbox = (res as any).inbox || [];
        const unread = inbox.filter(
          (m: any) => !m.readBy.includes((user as any)?.id),
        ).length;
        if (user && typeof lastCount === "number" && unread > lastCount) {
          const delta = unread - lastCount;
          const last = inbox[inbox.length - 1];
          try {
            const { toast } = await import("sonner");
            toast(`${delta} new message(s)`);
          } catch {}
          try {
            await audio.play().catch(() => {});
          } catch {}
          try {
            if (
              typeof Notification !== "undefined" &&
              Notification.permission === "granted"
            ) {
              new Notification("Team-Work", {
                body: last?.text
                  ? last.text.length > 60
                    ? last.text.slice(0, 57) + "..."
                    : last.text
                  : `${delta} new message(s)`,
                tag: "team-work-inbox",
              });
            }
          } catch {}
        }
        lastCount = unread;
      } catch {
        // ignore
      }
    }
    if (user) {
      poll();
      t = setInterval(poll, 2500);
    }
    return () => clearInterval(t);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
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
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
