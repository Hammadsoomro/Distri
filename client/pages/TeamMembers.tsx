import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TeamApi } from "@/lib/api";
import type { PublicUser } from "@shared/api";

function randomStat(seed: string, min = 30, max = 100) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  const v = Math.abs(h) % 1000;
  return min + (v % (max - min + 1));
}

export default function TeamMembers() {
  const [members, setMembers] = useState<PublicUser[]>([]);

  useEffect(() => {
    TeamApi.list().then((r) => setMembers(r.members)).catch(() => setMembers([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Team Members</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {members.map((m) => {
          const sales = randomStat(m.id + "s", 8000, 35000);
          const target = Math.round(sales * (0.8 + (randomStat(m.id + "t", 0, 40) / 100)));
          const percent = Math.round((sales / target) * 100);
          const calls = randomStat(m.id + "c", 10, 80);
          const demos = randomStat(m.id + "d", 1, 30);

          return (
            <Card key={m.id} className="bg-white/5 border-white/10 text-white p-0 overflow-hidden">
              <CardHeader className="p-4 text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-primary to-accent grid place-items-center text-2xl font-bold text-white">{(m.name || "?").split(" ").map(s=>s[0]).slice(0,2).join("")}</div>
                <CardTitle className="mt-3 text-lg">{m.name}</CardTitle>
                <div className="text-white/60 text-sm">{m.email}</div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-sm text-white/70">Sales</div>
                    <div className="text-xl font-extrabold">{sales.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/70">Target</div>
                    <div className="text-lg font-semibold">{target.toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <div>Progress</div>
                    <div className="font-semibold">{percent}%</div>
                  </div>
                  <div className="mt-2">
                    <Progress value={Math.min(100, percent)} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-white/70">
                  <div className="p-2 rounded bg-white/3">
                    <div className="font-medium">Calls</div>
                    <div className="text-white/80">{calls}</div>
                  </div>
                  <div className="p-2 rounded bg-white/3">
                    <div className="font-medium">Demos</div>
                    <div className="text-white/80">{demos}</div>
                  </div>
                  <div className="p-2 rounded bg-white/3">
                    <div className="font-medium">Open Leads</div>
                    <div className="text-white/80">{Math.max(0, Math.floor((target - sales) / 100))}</div>
                  </div>
                  <div className="p-2 rounded bg-white/3">
                    <div className="font-medium">Conversion</div>
                    <div className="text-white/80">{Math.max(10, Math.round((demos / Math.max(1, calls)) * 100))}%</div>
                  </div>
                </div>

              </CardContent>
            </Card>
          );
        })}

        {members.length === 0 && <p className="text-white/60">No members yet.</p>}
      </div>
    </div>
  );
}
