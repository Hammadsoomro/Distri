import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamApi, DistributorApi } from "@/lib/api";
import type { Job, PublicUser } from "@shared/api";
import { Users, Database, Pause, Clock } from "lucide-react";

export default function Dashboard() {
  const [members, setMembers] = useState<PublicUser[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const load = async () => {
    try {
      const [teamRes, jobsRes] = await Promise.all([
        TeamApi.list(),
        DistributorApi.listJobs(),
      ]);
      setMembers(teamRes.members);
      setJobs(jobsRes.jobs);
    } catch {}
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  const runningJob = useMemo(
    () => jobs.find((j) => j.status === "running") || null,
    [jobs],
  );
  const totalDistributed = useMemo(() => {
    // Sum lines already sent (nextIndex is the next to send)
    return jobs.reduce(
      (sum, j) => sum + Math.min(j.nextIndex, j.textLines.length),
      0,
    );
  }, [jobs]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-extrabold">
          <Database className="h-10 w-10 text-purple-400" />
          Dashboard Overview
        </h1>
        <p className="text-purple-100/80">
          A high-level summary of your team's data distribution.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Team Members"
          value={members.length.toString()}
          icon={<Users className="h-8 w-8 text-purple-400" />}
          gradient="from-purple-600/20 to-indigo-600/20"
          border="border-purple-400/30"
        />
        <StatCard
          title="Total Lines Distributed"
          value={totalDistributed.toString()}
          icon={<Database className="h-8 w-8 text-blue-400" />}
          gradient="from-blue-500/20 to-cyan-500/20"
          border="border-blue-400/30"
        />
        <StatCard
          title="Distribution Status"
          value={runningJob ? "Running" : "Paused"}
          icon={<Pause className="h-8 w-8 text-gray-400" />}
          gradient="from-emerald-600/20 to-teal-600/20"
          border="border-emerald-400/30"
        />
        <StatCard
          title="Next Distribution In"
          value={runningJob ? `${runningJob.intervalSec}s` : "--"}
          icon={<Clock className="h-8 w-8 text-orange-400" />}
          gradient="from-orange-500/20 to-red-500/20"
          border="border-orange-400/30"
        />
      </section>

      <section>
        <Card className="bg-white/5 border-white/10 text-white backdrop-blur supports-[backdrop-filter]:bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-6 w-6 text-blue-400" /> Team Distribution
              Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 || !runningJob ? (
              <div className="text-center py-12 text-white/70">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-300">
                  No team members on the distribution list
                </p>
                <p className="text-gray-400">
                  Add members from the Team page to start distributing data
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-white/80">
                  Currently distributing to{" "}
                  <span className="font-semibold">
                    {runningJob.targets.length}
                  </span>{" "}
                  team member{runningJob.targets.length === 1 ? "" : "s"}.
                </p>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {members
                    .filter((m) => runningJob.targets.includes(m.id))
                    .map((m) => (
                      <li
                        key={m.id}
                        className="p-2 rounded bg-white/5 border border-white/10 flex items-center justify-between"
                      >
                        <span>
                          {m.name}{" "}
                          <span className="text-white/60">({m.email})</span>
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  border,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  border: string;
}) {
  return (
    <div>
      <div
        className={
          "text-white rounded-lg p-6 bg-[#020817] border shadow " +
          border +
          " " +
          `bg-gradient-to-br ${gradient} shadow-black/40`
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">{title}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
          </div>
          <div>{icon}</div>
        </div>
      </div>
    </div>
  );
}
