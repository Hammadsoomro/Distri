import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LayoutGrid, Users, Network, MessageSquare, LogOut } from "lucide-react";

export function Sidebar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  if (!user) return null;
  const Item = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center justify-center h-12 w-12 rounded-lg text-gray-300 hover:text-white transition",
        loc.pathname.startsWith(to) ? "bg-purple-600 text-white" : ""
      )}
      title={label}
    >
      <Icon className="h-6 w-6" />
    </Link>
  );
  return (
    <aside className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center justify-between py-4 bg-gradient-to-b from-indigo-900 to-slate-900 border-r border-white/10">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-purple-500 shadow-lg shadow-purple-500/30" />
      </div>
      <nav className="flex-1 flex flex-col items-center gap-2 mt-4">
        <Item to="/dashboard" icon={LayoutGrid} label="Dashboard" />
        {user.role === "admin" && <Item to="/distributor" icon={Network} label="Distributor" />}
        <Item to="/chat" icon={MessageSquare} label="Chat" />
        {user.role === "admin" && <Item to="/team" icon={Users} label="Team" />}
      </nav>
      <button
        onClick={() => {
          logout();
          nav("/");
        }}
        className="flex items-center justify-center h-10 w-10 rounded-full text-red-400 hover:text-red-300 hover:bg-white/5"
        title="Logout"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </aside>
  );
}
