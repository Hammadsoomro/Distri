import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import Distributor from "./Distributor";
import Inbox from "./Inbox";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const { user } = useAuth();
  const nav = useNavigate();

  if (user?.role === "admin") {
    return (
      <div className="space-y-6">
        <Hero />
        <Distributor />
      </div>
    );
  }

  if (user) {
    return (
      <div className="space-y-6">
        <Hero />
        <Inbox />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <div>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Send automated per-line messages to your team
        </h1>
        <p className="mt-4 text-white/70 text-lg">
          Login, signup, and distributor — everything in one place. Configure timers and lines per send, create team member accounts (name, email, password), and they will receive messages in their inbox.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => nav("/login")}>Login</Button>
          <Button variant="secondary" onClick={() => nav("/signup")}>Admin Setup</Button>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4">
          {["30-300s timers (configurable)", "Multiple lines per send (1,3,5,7,10,12,15)", "Admin-controlled team", "Real-time inbox"].map((f) => (
            <Card key={f} className="bg-white/5 border-white/10 text-white"><CardContent className="p-4">{f}</CardContent></Card>
          ))}
        </div>
      </div>
      <div className="relative">
        <PreviewPanel />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="rounded-2xl border border-white/10 p-6 bg-gradient-to-r from-primary/20 to-transparent">
      <p className="uppercase text-xs tracking-widest text-primary-foreground/80 bg-primary/30 inline-flex px-2 py-1 rounded">Nayi App</p>
      <h2 className="mt-3 text-3xl font-extrabold">Line Distributor – Aap ki team ke liye</h2>
      <p className="mt-2 text-white/70">Per-line text distribution with smart timers. Beautiful, fast, and reliable.</p>
    </div>
  );
}

function PreviewPanel() {
  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/5">
      <div className="h-64 rounded bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent)] flex items-center justify-center text-white/70">
        Distribution UI preview
      </div>
      <p className="mt-3 text-white/60 text-sm">Login karke full distributor use karein.</p>
    </div>
  );
}
