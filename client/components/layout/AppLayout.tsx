import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0b1b3a] to-[#020617] text-white">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary shadow-lg shadow-primary/30" />
            <span className="font-extrabold tracking-tight text-lg">
              Team-Work
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <NavLink to="/" label="Home" current={loc.pathname === "/"} />
            {user?.role === "admin" && (
              <>
                <NavLink
                  to="/team"
                  label="Team"
                  current={loc.pathname.startsWith("/team")}
                />
                <NavLink
                  to="/distributor"
                  label="Distributor"
                  current={loc.pathname.startsWith("/distributor")}
                />
                <NavLink
                  to="/jobs"
                  label="Jobs"
                  current={loc.pathname.startsWith("/jobs")}
                />
              </>
            )}
            {user && (
              <NavLink
                to="/chat"
                label="Chat"
                current={loc.pathname.startsWith("/chat")}
              />
            )}
            {user && (
              <NavLink
                to="/inbox"
                label={`Inbox${unread ? ` (${unread})` : ""}`}
                current={loc.pathname.startsWith("/inbox")}
              />
            )}
          </nav>
          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Button
                  variant="ghost"
                  className="text-white/80"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button onClick={() => navigate("/signup")}>Admin Setup</Button>
              </>
            ) : (
              <>
                <span className="hidden sm:block text-white/70 text-sm mr-2">
                  {user.name} ({user.role})
                </span>
                <Button
                  variant="secondary"
                  onClick={() =>
                    navigate(user.role === "admin" ? "/distributor" : "/inbox")
                  }
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="text-white/80"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
      <footer className="mt-16 border-t border-white/10 py-8 text-center text-white/60 text-sm">
        © {new Date().getFullYear()} Team-Work • Built for teams
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
