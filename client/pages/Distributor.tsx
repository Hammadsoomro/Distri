import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamApi, DistributorApi } from "@/lib/api";
import type { PublicUser, Job } from "@shared/api";

export default function Distributor() {
  const [members, setMembers] = useState<PublicUser[]>([]);
  const [rawInput, setRawInput] = useState("");
  const [distAccum, setDistAccum] = useState("");
  const intervalOptions = [30, 60, 120, 180, 240, 300] as const;
  const lineOptions = [1, 3, 5, 7, 10, 12, 15] as const;
  const [intervalSec, setIntervalSec] =
    useState<(typeof intervalOptions)[number]>(30);
  const [linesPerTick, setLinesPerTick] =
    useState<(typeof lineOptions)[number]>(1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [historyJobs, setHistoryJobs] = useState<{ id: string; status: Job["status"]; queue: { lineNumber: number; line: string; userId: string; status: "sent" | "pending" | "failed"; }[] }[]>([]);

  const loadMembers = async () => {
    const res = await TeamApi.list();
    setMembers(res.members);
  };
  const loadRunningJob = async () => {
    const res = await DistributorApi.listJobs();
    const running = res.jobs.find((j) => j.status === "running") || null;
    setJob(running);
  };

  useEffect(() => {
    loadMembers();
    loadRunningJob();
    const loadHistory = async () => {
      try {
        const res = await DistributorApi.listQueues();
        setHistoryJobs(res.jobs);
      } catch {}
    };
    loadHistory();
    const t = setInterval(loadHistory, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!job) return;
    const t = setInterval(async () => {
      const res = await DistributorApi.getJob(job.id);
      setJob(res.job);
    }, 2000);
    return () => clearInterval(t);
  }, [job?.id]);

  const dedupText = useMemo(() => {
    const lines = rawInput.replace(/\r\n/g, "\n").split("\n");
    const seen = new Set<string>();
    const kept: string[] = [];
    for (const raw of lines) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const words = trimmed
        .replace(/[\t]+/g, " ")
        .split(/\s+/)
        .slice(0, 15)
        .map((w) => w.replace(/^[^\w]+|[^\w]+$/g, "").toLowerCase())
        .filter(Boolean);
      const key = words.join(" ");
      if (key && !seen.has(key)) {
        seen.add(key);
        kept.push(trimmed);
      }
    }
    return kept.join("\n");
  }, [rawInput]);


  const start = async () => {
    setError(null);
    try {
      const targetIds = Object.keys(selected).filter((k) => selected[k]);
      const res = await DistributorApi.createJob({
        text: distAccum,
        intervalSec,
        linesPerTick,
        targetIds,
      });
      setJob(res.job);
      if (!locked) setRawInput("");
    } catch (e: any) {
      setError(e.message || "Failed to start job");
    }
  };

  const cancel = async (id: string) => {
    await DistributorApi.cancelJob(id);
    const res = await DistributorApi.getJob(id);
    setJob(res.job);
  };

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const memberById = useMemo(() => {
    const map: Record<string, PublicUser> = {};
    for (const m of members) map[m.id] = m;
    return map;
  }, [members]);

  const queueRows = useMemo(() => {
    if (!job && (!historyJobs || historyJobs.length === 0) && !distributorText.trim()) return [] as {
      index: number;
      line: string;
      userId: string;
      userLabel: string;
      status: "sent" | "pending" | "failed";
    }[];

    let rows: {
      index: number;
      line: string;
      userId: string;
      userLabel: string;
      status: "sent" | "pending" | "failed";
    }[] = [];

    if (job?.queue && job.queue.length) {
      rows = job.queue.map((q) => {
        const m = memberById[q.userId];
        const userLabel = m ? `${m.name} (${m.email})` : q.userId;
        return {
          index: q.lineNumber,
          line: q.line,
          userId: q.userId,
          userLabel,
          status: q.status,
        };
      });
    } else if (job) {
      const T = job.targets.length || 1;
      const L = job.linesPerTick;
      const round = T * L;
      for (let i = 0; i < job.textLines.length; i++) {
        const inRound = i % round;
        const targetIdx = Math.floor(inRound / L);
        const userId = job.targets[targetIdx] || job.targets[0];
        const m = memberById[userId];
        const userLabel = m ? `${m.name} (${m.email})` : userId;
        const status = i < job.nextIndex ? "sent" : "pending";
        rows.push({ index: i + 1, line: job.textLines[i], userId, userLabel, status });
      }
    }

    // If no running job, preview current Distributor text mapping (pending)
    if (!job && distributorText.trim()) {
      const previewLines = distributorText.replace(/\r\n/g, "\n").split("\n");
      const targetsArray = Object.keys(selected).filter((k) => selected[k]);
      const L = linesPerTick;
      const round = (targetsArray.length || 1) * L;
      for (let i = 0; i < previewLines.length; i++) {
        const inRound = i % round;
        const targetIdx = Math.floor(inRound / L);
        const userId = (targetsArray[targetIdx] || targetsArray[0]) as string | undefined;
        const m = userId ? memberById[userId] : undefined;
        const userLabel = userId ? (m ? `${m.name} (${m.email})` : userId) : "—";
        rows.push({ index: i + 1, line: previewLines[i], userId: userId || "", userLabel, status: "pending" });
      }
    }

    // Append previous jobs' queues
    const excludeId = job?.id;
    for (const hj of historyJobs) {
      if (excludeId && hj.id === excludeId) continue;
      for (const q of hj.queue || []) {
        const m = memberById[q.userId];
        const userLabel = m ? `${m.name} (${m.email})` : q.userId;
        rows.push({ index: q.lineNumber, line: q.line, userId: q.userId, userLabel, status: q.status });
      }
    }

    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.line.toLowerCase().includes(q) ||
        r.userLabel.toLowerCase().includes(q) ||
        r.index.toString() === q ||
        r.status.toLowerCase().includes(q),
    );
  }, [job, memberById, search, historyJobs, distributorText, linesPerTick, selected]);

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle>De-Duplication</CardTitle>
          <CardDescription className="text-white/70">
            Paste lines here. If first 15 words match, duplicates are removed live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Input</Label>
            <Textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              rows={8}
              className="bg-white/10 text-white border-white/20 placeholder:text-white/40"
              placeholder={"Paste or type lines here for de-duplication"}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Kept lines: {dedupText ? dedupText.split("\n").length : 0}</span>
            <div className="flex items-center gap-2">
              {!locked ? (
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setLocked(true);
                    setLockedText(dedupText);
                  }}
                >
                  Add to Distributor
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setLocked(false);
                    setLockedText("");
                  }}
                >
                  Unlock
                </Button>
              )}
              {locked && <span className="text-green-300">Saved</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle>Distributor</CardTitle>
          <CardDescription className="text-white/70">
            Set timer and lines-per-send
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {job && job.status === "running" && (
            <div className="flex items-center justify-between rounded border border-white/10 bg-white/5 p-3">
              <div>
                <p className="font-medium">Job running • {job.linesPerTick} lines • {job.intervalSec}s</p>
                <p className="text-white/60 text-sm">You can start another job while this runs. Queue is below.</p>
              </div>
              <Button variant="destructive" onClick={() => cancel(job.id)}>Cancel</Button>
            </div>
          )}

          <div>
            <Label className="text-white">
              Text (each line will be sent separately)
            </Label>
            <Textarea
              value={distributorText}
              readOnly
              rows={10}
              className="bg-white/10 text-white border-white/20"
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
            disabled={!distributorText.trim() || !Object.values(selected).some(Boolean)}
          >
            Start
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Queue</CardTitle>
            <CardDescription className="text-white/70">
              Line-wise progress with recipient and status
            </CardDescription>
          </div>
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search line, user, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/10 text-white border-white/20 placeholder:text-white/40"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 bg-white/5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">Line #</TableHead>
                    <TableHead>Line</TableHead>
                    <TableHead className="w-[280px]">User</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueRows.map((r) => (
                    <TableRow key={`${r.index}-${r.userId}`}>
                      <TableCell>#{r.index}</TableCell>
                      <TableCell className="text-white/90 whitespace-pre-wrap">{r.line}</TableCell>
                      <TableCell className="text-white/80">{r.userLabel}</TableCell>
                      <TableCell>
                        <span
                          className={
                            r.status === "sent"
                              ? "text-green-400"
                              : r.status === "failed"
                                ? "text-red-400"
                                : "text-yellow-300"
                          }
                        >
                          {r.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {queueRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-white/60">
                        No matching rows
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
