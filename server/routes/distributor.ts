import type { RequestHandler } from "express";
import { AuthedRequest, requireUser } from "../auth";
import { db, DistributionJob, newId } from "../store";

function startTimer(job: DistributionJob) {
  const tick = () => {
    if (job.status !== "running") return;
    const linesToSend = job.linesPerTick;
    if (job.nextIndex >= job.textLines.length) {
      // All lines sent
      job.status = "completed";
      if (job._timer) clearInterval(job._timer);
      job._timer = undefined as any;
      return;
    }
    // For each target, send up to linesToSend lines sequentially
    for (const targetId of job.targets) {
      const target = db.users.get(targetId);
      if (!target) continue;
      for (let i = 0; i < linesToSend && job.nextIndex < job.textLines.length; i++) {
        const line = job.textLines[job.nextIndex++];
        const msgId = newId("msg");
        const msg = {
          id: msgId,
          text: line,
          fromId: job.ownerId,
          ts: Date.now(),
          readBy: [],
          conversationId: undefined,
        };
        target.inbox.push(msg);
        db.messages.set(msgId, msg);
      }
    }
  };
  job._timer = setInterval(tick, job.intervalSec * 1000);
}

export const createJob: RequestHandler = (req, res) => {
  const areq = req as AuthedRequest;
  if (!requireUser(areq, res, "admin")) return;
  const { text, intervalSec, linesPerTick, targetIds } = req.body || {};
  const validIntervals = [30, 60, 120, 180, 240, 300];
  const validLines = [1, 3, 5, 7, 10, 12, 15];
  if (typeof text !== "string" || !text.trim()) return res.status(400).json({ error: "Invalid text" });
  if (!validIntervals.includes(Number(intervalSec))) return res.status(400).json({ error: "Invalid interval" });
  if (!validLines.includes(Number(linesPerTick))) return res.status(400).json({ error: "Invalid linesPerTick" });
  const targets: string[] = Array.isArray(targetIds) ? targetIds : [];
  if (!targets.length) return res.status(400).json({ error: "No targets" });
  const textLines = text.replace(/\r\n/g, "\n").split("\n");
  const id = newId("job");
  const job: DistributionJob = {
    id,
    ownerId: areq.user!.id,
    createdAt: Date.now(),
    intervalSec: Number(intervalSec),
    linesPerTick: Number(linesPerTick),
    targets,
    textLines,
    nextIndex: 0,
    status: "running",
  };
  db.jobs.set(id, job);
  startTimer(job);
  res.json({ job: { ...job, _timer: undefined } });
};

export const listJobs: RequestHandler = (req, res) => {
  const areq = req as AuthedRequest;
  if (!requireUser(areq, res, "admin")) return;
  const jobs = Array.from(db.jobs.values())
    .filter((j) => j.ownerId === areq.user!.id)
    .map((j) => ({ ...j, _timer: undefined }));
  res.json({ jobs });
};

export const getJob: RequestHandler = (req, res) => {
  const areq = req as AuthedRequest;
  if (!requireUser(areq, res, "admin")) return;
  const { id } = req.params;
  const job = id ? db.jobs.get(id) : undefined;
  if (!job || job.ownerId !== areq.user!.id) return res.status(404).json({ error: "Not found" });
  res.json({ job: { ...job, _timer: undefined } });
};

export const cancelJob: RequestHandler = (req, res) => {
  const areq = req as AuthedRequest;
  if (!requireUser(areq, res, "admin")) return;
  const { id } = req.params;
  const job = id ? db.jobs.get(id) : undefined;
  if (!job || job.ownerId !== areq.user!.id) return res.status(404).json({ error: "Not found" });
  if (job._timer) clearInterval(job._timer);
  job.status = "cancelled";
  job._timer = undefined as any;
  res.json({ job: { ...job, _timer: undefined } });
};
