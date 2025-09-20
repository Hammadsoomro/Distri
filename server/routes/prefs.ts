import type { RequestHandler } from "express";
import { requireUser } from "../auth";
import { PrefsModel } from "../db";

export const getPrefs: RequestHandler = async (req, res) => {
  const anyReq = req as any;
  if (!requireUser(anyReq, res)) return;
  const userId = anyReq.user!.id;
  const doc = await PrefsModel.findOne({ userId }).lean().exec();
  res.json({ sidebarCollapsed: Boolean(doc?.sidebarCollapsed) });
};

export const setPrefs: RequestHandler = async (req, res) => {
  const anyReq = req as any;
  if (!requireUser(anyReq, res)) return;
  const userId = anyReq.user!.id;
  const { sidebarCollapsed } = (req.body as any) || {};
  await PrefsModel.updateOne(
    { userId },
    { $set: { sidebarCollapsed: Boolean(sidebarCollapsed) } },
    { upsert: true },
  ).exec();
  res.json({ ok: true });
};
