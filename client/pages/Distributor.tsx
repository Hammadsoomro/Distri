import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TeamApi, DistributorApi } from "@/lib/api";
import type { PublicUser, Job } from "@shared/api";

export default function Distributor() {
  const [members, setMembers] = useState<PublicUser[]>([]);
  const [text, setText] = useState("");
  const intervalOptions = [30, 60, 120, 180, 240, 300] as const;
  const lineOptions = [1, 3, 5, 7, 10, 12, 15] as const;
  const [intervalSec, setIntervalSec] =
    useState<(typeof intervalOptions)[number]>(30);
  const [linesPerTick, setLinesPerTick] =
    useState<(typeof lineOptions)[number]>(1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [job, setJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await TeamApi.list();
    setMembers(res.members);
  };
  const loadJobs = async () => {
    const res = await DistributorApi.listJobs();
    setJobs(res.jobs);
  };

  useEffect(() => {
    load();
    loadJobs();
  }, []);
  useEffect(() => {
    if (!job) return;
    const t = setInterval(async () => {
      const res = await DistributorApi.getJob(job.id);
      setJob(res.job);
      loadJobs();
    }, 2000);
    return () => clearInterval(t);
  }, [job?.id]);

  const start = async () => {
    setError(null);
    try {
      const targetIds = Object.keys(selected).filter((k) => selected[k]);
      const res = await DistributorApi.createJob({
        text,
        intervalSec,
        linesPerTick,
        targetIds,
      });
      setJob(res.job);
      setText("");
    } catch (e: any) {
      setError(e.message || "Failed to start job");
    }
  };

  const cancel = async (id: string) => {
    await DistributorApi.cancelJob(id);
    const res = await DistributorApi.getJob(id);
    setJob(res.job);
    await loadJobs();
  };

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle>Distributor</CardTitle>
          <CardDescription className="text-white/70">
            Set timer and lines-per-send
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">
              Text (each line will be sent separately)
            </Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="bg-white/10 text-white border-white/20 placeholder:text-white/40"
              placeholder={
                "Write lines here...\nEach line will be sent as a separate message."
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white mb-2 block">Timer (sec)</Label>
              <div className="flex gap-2 flex-wrap">
                {intervalOptions.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={intervalSec === s ? "default" : "secondary"}
                    onClick={() => setIntervalSec(s as any)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-white mb-2 block">Lines per send</Label>
              <div className="flex gap-2 flex-wrap">
                {lineOptions.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={linesPerTick === s ? "default" : "secondary"}
                    onClick={() => setLinesPerTick(s as any)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Label className="text-white mb-2 block">Recipients (Team)</Label>
            <div className="grid sm:grid-cols-2 gap-2">
              {members.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/10"
                >
                  <Checkbox
                    checked={!!selected[m.id]}
                    onCheckedChange={() => toggle(m.id)}
                  />
                  <span>
                    {m.name} <span className="text-white/60">({m.email})</span>
                  </span>
                </label>
              ))}
              {members.length === 0 && (
                <p className="text-white/60">Add team members first.</p>
              )}
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            type="button"
            onClick={start}
            disabled={!text.trim() || !Object.values(selected).some(Boolean)}
          >
            Start
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
          <CardDescription className="text-white/70">
            Running and completed jobs
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
    </div>
  );
}
