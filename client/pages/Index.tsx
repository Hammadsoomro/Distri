import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import Distributor from "./Distributor";
import Inbox from "./Inbox";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Globe, Shield } from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const nav = useNavigate();

  if (user?.role === "admin") {
    return (
      <div className="space-y-6">
        <DashboardHero />
        <Distributor />
      </div>
    );
  }

  if (user) {
    return (
      <div className="space-y-6">
        <DashboardHero />
        <Inbox />
      </div>
    );
  }

  return <PublicLanding />;
}

function DashboardHero() {
  return (
    <div className="rounded-2xl border border-white/10 p-6 bg-gradient-to-r from-primary/20 to-transparent">
      <p className="uppercase text-xs tracking-widest text-primary-foreground/80 bg-primary/30 inline-flex px-2 py-1 rounded">
        Welcome
      </p>
      <h2 className="mt-3 text-3xl font-extrabold">Line Distributor – For your team</h2>
      <p className="mt-2 text-white/70">
        Per-line text distribution with smart timers. Beautiful, fast, and reliable.
      </p>
    </div>
  );
}

function PublicLanding() {
  const nav = useNavigate();
  return (
    <div className="space-y-16">
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
          <span className="block bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">
            Connect with
          </span>
          <span className="block bg-gradient-to-r from-fuchsia-500 to-primary bg-clip-text text-transparent mt-2">
            Anyone
          </span>
          <span className="block bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent mt-2">
            Anywhere
          </span>
        </h1>
        <p className="mt-5 text-white/80 text-lg">
          Professional messaging and distribution platform with real-time inbox,
          configurable timers, and team management.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button onClick={() => nav("/signup")} className="px-6">Get Started</Button>
          <Button variant="outline" onClick={() => nav("/login")} className="px-6">
            Login
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {[
          {
            icon: <MessageSquare className="h-6 w-6 text-primary" />,
            title: "Real-time Messaging",
            text:
              "Instant delivery with typing indicators, read receipts, and synced across devices.",
          },
          {
            icon: <Globe className="h-6 w-6 text-primary" />,
            title: "Global Reach",
            text:
              "Reliable distribution to your whole team with flexible line batching.",
          },
        	{
            icon: <Shield className="h-6 w-6 text-primary" />,
            title: "Secure & Controlled",
            text:
              "Admin-controlled team with per-member access and audit-friendly design.",
          },
        ].map((f) => (
          <Card key={f.title} className="bg-white/5 border-white/10 text-white backdrop-blur">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-primary/20">{f.icon}</div>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-white/70 text-sm mt-1">{f.text}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="max-w-4xl mx-auto text-center text-white/70">
        <p>
          Login, signup, and distributor — everything in one place. Configure timers and lines per send,
          create team member accounts, and they will receive messages in their inbox.
        </p>
      </section>
    </div>
  );
}
