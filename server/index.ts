import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { authMiddleware } from "./auth";
import { adminSetup, login, me } from "./routes/auth";
import { listTeam, createMember, deleteMember } from "./routes/team";
import { createJob, listJobs, getJob, cancelJob } from "./routes/distributor";
import { getInbox, clearInbox } from "./routes/inbox";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(authMiddleware);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/api/auth/admin-setup", adminSetup);
  app.post("/api/auth/login", login);
  app.get("/api/auth/me", me);

  // Team management (admin)
  app.get("/api/team", listTeam);
  app.post("/api/team", createMember);
  app.delete("/api/team/:id", deleteMember);

  // Distributor jobs (admin)
  app.post("/api/distribute", createJob);
  app.get("/api/jobs", listJobs);
  app.get("/api/jobs/:id", getJob);
  app.post("/api/jobs/:id/cancel", cancelJob);

  // Inbox (member or admin)
  app.get("/api/inbox", getInbox);
  app.post("/api/inbox/clear", clearInbox);

  return app;
}
