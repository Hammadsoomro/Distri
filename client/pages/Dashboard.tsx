import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { TeamApi } from "@/lib/api";

function Ring({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative h-48 w-48">
      <div
        className="h-full w-full rounded-full"
        style={{
          background: `conic-gradient(hsl(var(--primary)) ${pct * 3.6}deg, hsl(var(--muted)) ${pct * 3.6}deg)`
        }}
      />
      <div className="absolute inset-3 rounded-full bg-background grid place-items-center border border-border">
        <span className="text-2xl font-bold">{pct}%</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    TeamApi.list()
      .then((res) => {
        const members = res.members.slice(0, 5).map((m) => ({ id: m.id, name: m.name, sales: 20000 + Math.floor(Math.random() * 10000), target: 15000 + Math.floor(Math.random() * 2000), img: undefined }));
        setLeaders(members);
      })
      .catch(() => {
        // fallback static
        setLeaders([
          { id: 1, name: "Leader 1", sales: 24569, target: 15700, img: undefined },
          { id: 2, name: "Leader 2", sales: 24569, target: 15700, img: undefined },
          { id: 3, name: "Leader 3", sales: 23000, target: 15500, img: undefined },
          { id: 4, name: "Leader 4", sales: 18750, target: 15700, img: undefined },
          { id: 5, name: "Leader 5", sales: 14040, target: 13500, img: undefined },
        ]);
      });

  }, []);

  const salesThisWeek = 155241;
  const target = 155200;
  const pct = Math.round((salesThisWeek / target) * 100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold">Sales team performance management KPI dashboard</h1>
      <p className="text-white/70 text-sm max-w-3xl">
        This dashboard helps sales team managers display and review performance rankings. It shows weekly sales score, target percentage, total target, and team member stats.
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/70">Sales Done This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight">{salesThisWeek.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/70">Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight">{target.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/70">% of Target</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
              <Ring value={pct} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {leaders.map((p, i) => {
            const percent = Math.round((p.sales / p.target) * 100);
            return (
              <Card key={p.id} className="bg-white/5 border-white/10 text-white">
                <CardContent className="p-4">
                  <div className="grid grid-cols-[60px_1fr_auto] sm:grid-cols-[80px_1fr_auto] gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-primary/20 text-primary grid place-items-center font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <Avatar className="hidden sm:inline-flex">
                        <AvatarImage src={p.img} alt={p.name} />
                        <AvatarFallback>{p.name.slice(0,2)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold">Add Text Here</div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-white/80">
                        <div>Sales</div>
                        <div className="text-right">{p.sales.toLocaleString()}</div>
                        <div>Target</div>
                        <div className="text-right">{p.target.toLocaleString()}</div>
                      </div>
                      <div className="mt-2">
                        <Progress value={Math.min(100, (p.sales / p.target) * 100)} />
                      </div>
                    </div>
                    <div className="text-right font-semibold min-w-12">{percent}%</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
