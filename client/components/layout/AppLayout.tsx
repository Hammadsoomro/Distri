import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "1";
    } catch {
      return true;
    }
  });

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

  useEffect(() => {
    try {
      localStorage.setItem("sidebar_collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

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
      <main
        className={cn(
          collapsed ? "pl-20" : "pl-64",
          "container mx-auto px-4 py-8",
        )}
      >
        {children}
      </main>
      <footer className="mt-16 border-t border-white/10 py-8 text-center text-white/60 text-sm">
        © {new Date().getFullYear()} Line Distributor • Built for teams
      </footer>
    </div>
  );
}

function NavLink({
  to,
  label,
  current,
}: {
  to: string;
  label: string;
  current: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "hover:text-white/90 transition",
        current ? "text-white" : "text-white/70",
      )}
    >
      {label}
    </Link>
  );
}
