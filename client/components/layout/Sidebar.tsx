import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LayoutGrid, Users, Network, MessageSquare, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
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
    <aside className={cn("fixed left-0 top-0 h-screen flex flex-col justify-between py-4 bg-gradient-to-b from-indigo-900 to-slate-900 border-r border-white/10", collapsed ? "items-center w-20" : "items-stretch w-64")}>
      <div className={cn("flex items-center gap-3", collapsed ? "justify-center px-0" : "justify-start px-4")}>
        <div className="h-10 w-10 rounded-lg bg-purple-500 shadow-lg shadow-purple-500/30" />
      </div>
      <nav className={cn("flex-1 flex flex-col gap-2 mt-4", collapsed ? "items-center" : "items-stretch px-2")}>
        <Item to="/dashboard" icon={LayoutGrid} label="Dashboard" />
        {user.role === "admin" && <Item to="/distributor" icon={Network} label="Distributor" />}
        <Item to="/chat" icon={MessageSquare} label="Chat" />
        {user.role === "admin" && <Item to="/team" icon={Users} label="Team" />}
      </nav>
      <div className={cn("relative", collapsed ? "px-0" : "px-3")}>
        <button
          onClick={onToggle}
          className="absolute -right-3 top-0 h-8 w-8 rounded-full bg-purple-600 text-slate-900 flex items-center justify-center shadow-lg shadow-purple-600/30"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <button
          onClick={() => {
            logout();
            nav("/");
          }}
          className={cn("flex items-center rounded-full text-red-400 hover:text-red-300 hover:bg-white/5", collapsed ? "justify-center h-10 w-10" : "justify-center h-10 w-full")}
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-2 text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
