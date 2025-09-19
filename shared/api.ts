/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export type Role = "admin" | "member";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  inbox: string[];
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface TeamListResponse {
  members: PublicUser[];
}

export interface CreateMemberRequest {
  name: string;
  email: string;
  password: string;
}

export interface Job {
  id: string;
  ownerId: string;
  createdAt: number;
  intervalSec: number;
  linesPerTick: number;
  targets: string[];
  textLines: string[];
  nextIndex: number;
  status: "running" | "completed" | "cancelled";
}

export interface CreateJobRequest {
  text: string;
  intervalSec: 30 | 60 | 120 | 180 | 240 | 300;
  linesPerTick: 1 | 3 | 5 | 7 | 10 | 12 | 15;
  targetIds: string[];
}

export interface JobsListResponse { jobs: Job[] }
export interface JobResponse { job: Job }

export interface InboxResponse { inbox: string[] }
