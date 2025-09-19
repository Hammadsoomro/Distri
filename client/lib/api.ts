import {
  AuthResponse,
  CreateJobRequest,
  CreateMemberRequest,
  InboxResponse,
  JobResponse,
  JobsListResponse,
  PublicUser,
  TeamListResponse,
} from "@shared/api";

const tokenKey = "auth_token";

export function getToken() {
  return localStorage.getItem(tokenKey) || "";
}

export function setToken(t: string) {
  localStorage.setItem(tokenKey, t);
}

export function clearToken() {
  localStorage.removeItem(tokenKey);
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as any),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    let message = `${res.status}`;
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export const AuthApi = {
  async adminSetup(name: string, email: string, password: string) {
    return api<AuthResponse>("/api/auth/admin-setup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },
  async login(email: string, password: string) {
    return api<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  async me() {
    const res = await api<{ user: PublicUser }>("/api/auth/me");
    return res.user;
  },
};

export const TeamApi = {
  async list() {
    return api<TeamListResponse>("/api/team");
  },
  async create(input: CreateMemberRequest) {
    return api<{ member: PublicUser }>("/api/team", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async remove(id: string) {
    return api<{ ok: true }>(`/api/team/${id}`, { method: "DELETE" });
  },
};

export const DistributorApi = {
  async createJob(input: CreateJobRequest) {
    return api<JobResponse>("/api/distribute", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async listJobs() {
    return api<JobsListResponse>("/api/jobs");
  },
  async getJob(id: string) {
    return api<JobResponse>(`/api/jobs/${id}`);
  },
  async cancelJob(id: string) {
    return api<JobResponse>(`/api/jobs/${id}/cancel`, { method: "POST" });
  },
};

export const InboxApi = {
  async get() {
    return api<InboxResponse>("/api/inbox");
  },
  async clear() {
    return api<{ ok: true }>("/api/inbox/clear", { method: "POST" });
  },
  async markRead(messageIds?: string[]) {
    return api<{ ok: true }>("/api/inbox/mark-read", {
      method: "POST",
      body: JSON.stringify({ messageIds }),
    });
  },
};

export const ChatApi = {
  async listConversations() {
    return api<ConversationsListResponse>("/api/chat");
  },
  async createConversation(
    participantIds: string[],
    isGroup = false,
    name?: string,
  ) {
    return api<{ conversation: Conversation }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ participantIds, isGroup, name }),
    });
  },
  async getConversation(id: string) {
    return api<ConversationResponse>(`/api/chat/${id}`);
  },
  async sendMessage(conversationId: string, text: string) {
    return api<{ message: Message }>("/api/chat/send", {
      method: "POST",
      body: JSON.stringify({ conversationId, text }),
    });
  },
  async markRead(conversationId: string) {
    return api<{ ok: true }>("/api/chat/mark-read", {
      method: "POST",
      body: JSON.stringify({ conversationId }),
    });
  },
};
