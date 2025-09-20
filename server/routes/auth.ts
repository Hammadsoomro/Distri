import type { RequestHandler } from "express";
import {
  adminExists,
  db,
  findUserByEmail,
  hashPassword,
  newId,
  publicUser,
} from "../store";
import { signToken } from "../auth";

function setAuthCookie(res: any, token: string) {
  res.cookie("auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  });
}

export const adminSetup: RequestHandler = (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });
  if (adminExists())
    return res.status(400).json({ error: "Admin already exists" });
  if (findUserByEmail(email))
    return res.status(400).json({ error: "Email already in use" });
  const id = newId("user");
  const user = {
    id,
    name,
    email,
    passwordHash: hashPassword(password),
    role: "admin" as const,
    inbox: [],
  };
  db.users.set(id, user);
  const token = signToken({ uid: id, ts: Date.now() });
  setAuthCookie(res, token);
  res.json({ token, user: publicUser(user) });
};

export const login: RequestHandler = (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });
  const u = findUserByEmail(email);
  if (!u || u.passwordHash !== hashPassword(password))
    return res.status(401).json({ error: "Invalid credentials" });
  const token = signToken({ uid: u.id, ts: Date.now() });
  setAuthCookie(res, token);
  res.json({ token, user: publicUser(u) });
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie("auth_token", { path: "/" });
  res.json({ ok: true });
};

export const me: RequestHandler = (req, res) => {
  const anyReq = req as any;
  const u = anyReq.user;
  if (!u) return res.status(401).json({ error: "Unauthorized" });
  res.json({ user: publicUser(u) });
};
