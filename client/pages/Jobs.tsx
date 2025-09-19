import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DistributorApi } from "@/lib/api";
import type { Job } from "@shared/api";

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const load = async () => {
    const res = await DistributorApi.listJobs();
    setJobs(res.jobs);
  };
  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  const cancel = async (id: string) => {
    await DistributorApi.cancelJob(id);
    await load();
  };

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
          {jobs.map((j) => (
            <div
              key={j.id}
              className="p-3 rounded bg-white/5 border border-white/10 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">
                  {j.status.toUpperCase()} • {j.linesPerTick} lines •{" "}
                  {j.intervalSec}s
                </p>
                <p className="text-white/60 text-sm">
                  Sent {j.nextIndex}/{j.textLines.length} lines
                </p>
              </div>
              {j.status === "running" ? (
                <Button variant="destructive" onClick={() => cancel(j.id)}>
                  Cancel
                </Button>
              ) : (
                <span className="text-white/60 text-sm">Done</span>
              )}
            </div>
          ))}
          {jobs.length === 0 && <p className="text-white/60">No jobs yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
