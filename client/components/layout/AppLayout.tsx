import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { PrefsApi } from "@/lib/api";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [collapsed, setCollapsed] = useState<boolean>(true);

  useEffect(() => {
    let t: any;
    async function poll() {
      try {
        const res = await (await import("@/lib/api")).InboxApi.get();
        const inbox = (res as any).inbox || [];
        const ucount = inbox.filter(
          (m: any) => !m.readBy.includes((user as any)?.id),
        ).length;
        setUnread(ucount);
      } catch {}
    }
    if (user) {
      poll();
      t = setInterval(poll, 2500);
    } else {
      setUnread(0);
    }
    return () => clearInterval(t);
  }, [user]);

  // Load and persist sidebar preference from/to server
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      try {
        const res = await PrefsApi.get();
        if (mounted) setCollapsed(Boolean((res as any).sidebarCollapsed));
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        await PrefsApi.save(collapsed);
      } catch {}
    })();
  }, [collapsed, user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen gradient-animated text-white">
        <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-white/5 border-b border-white/10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary shadow-lg shadow-primary/30" />
              <span className="font-extrabold tracking-tight text-lg">
                Line Distributor
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-white/80"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button onClick={() => navigate("/signup")}>Admin Setup</Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="mt-16 border-t border-white/10 py-8 text-center text-white/60 text-sm">
          © {new Date().getFullYear()} Line Distributor • Built for teams
        </footer>
      </div>
    );
  }
  return (
    <div className="min-h-screen gradient-animated text-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <main className={cn(collapsed ? "pl-20" : "pl-64", "container mx-auto px-4 py-8")}>
        {children}
      </main>
      <footer className="mt-16 border-t border-white/10 py-8 text-center text-white/60 text-sm">
        © {new Date().getFullYear()} Line Distributor • Built for teams
      </footer>
    </div>
  );
}
