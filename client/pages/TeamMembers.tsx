import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TeamApi } from "@/lib/api";
import type { PublicUser } from "@shared/api";

export default function TeamMembers() {
  const [members, setMembers] = useState<PublicUser[]>([]);

  useEffect(() => {
    TeamApi.list().then((r) => setMembers(r.members)).catch(() => setMembers([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Team Members</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {members.map((m) => (
          <Card key={m.id} className="bg-white/5 border-white/10 text-white">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary grid place-items-center font-bold">{(m.name || "?").slice(0,2)}</div>
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-white/60 text-sm">{m.email}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-white/70">Member details and stats can be shown here.</div>
            </CardContent>
          </Card>
        ))}
        {members.length === 0 && <p className="text-white/60">No members yet.</p>}
      </div>
    </div>
  );
}
