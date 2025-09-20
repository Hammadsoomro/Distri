import type { RequestHandler } from "express";
import { presence } from "../store";
import { requireUser, AuthedRequest } from "../auth";

const ONLINE_WINDOW_MS = 30_000; // 30s considered online

export const presencePing: RequestHandler = (req, res) => {
  const areq = req as AuthedRequest;
  if (!requireUser(areq, res)) return;
  presence.set(areq.user!.id, Date.now());
  res.json({ ok: true });
};

export const listOnline: RequestHandler = (req, res) => {
  const areq = req as AuthedRequest;
  if (!requireUser(areq, res)) return;
  const now = Date.now();
  const onlineIds = Array.from(presence.entries())
    .filter(([, ts]) => now - ts <= ONLINE_WINDOW_MS)
    .map(([id]) => id);
  res.json({ onlineIds });
};
