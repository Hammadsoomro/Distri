import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DistributorApi, TeamApi } from "@/lib/api";
import type { Job, PublicUser } from "@shared/api";

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [members, setMembers] = useState<PublicUser[]>([]);

  const load = async () => {
    const res = await DistributorApi.listJobs();
    setJobs(res.jobs);
  };
  const loadMembers = async () => {
    const res = await TeamApi.list();
    setMembers(res.members);
  };

  useEffect(() => {
    load();
    loadMembers();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  const cancel = async (id: string) => {
    await DistributorApi.cancelJob(id);
    await load();
  };

  const memberById = useMemo(() => {
    const map: Record<string, PublicUser> = {};
    for (const m of members) map[m.id] = m;
    return map;
  }, [members]);

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader>
        <CardTitle>Jobs</CardTitle>
        <CardDescription className="text-white/70">
          Distribution jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {jobs.map((j) => {
            const names = j.targets
              .map((id) => memberById[id]?.name || id)
              .join(", ");
            return (
              <Link key={j.id} to={`/jobs/${j.id}`} className="block">
                <div
                  className="p-3 rounded bg-white/5 border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {j.status.toUpperCase()} • {j.linesPerTick} lines • {j.intervalSec}s
                    </p>
                    <p className="text-white/60 text-sm">
                      To: {names || "—"}
                    </p>
                    <p className="text-white/60 text-sm">
                      Sent {j.nextIndex}/{j.textLines.length} lines
                    </p>
                  </div>
                  {j.status === "running" ? (
                    <Button variant="destructive" onClick={(e) => { e.preventDefault(); cancel(j.id); }}>
                      Cancel
                    </Button>
                  ) : (
                    <span className="text-white/60 text-sm">Done</span>
                  )}
                </div>
              </Link>
            );
          })}
          {jobs.length === 0 && <p className="text-white/60">No jobs yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
