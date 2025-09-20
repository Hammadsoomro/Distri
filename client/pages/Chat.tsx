import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatApi, PresenceApi, UsersApi } from "@/lib/api";
import type { ConversationSummary, Message, PublicUser } from "@shared/api";
import { useNavigate, useParams } from "react-router-dom";

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [members, setMembers] = useState<PublicUser[]>([]);
  const [onlineIds, setOnlineIds] = useState<string[]>([]);
  const nav = useNavigate();
  const { id } = useParams();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadConvos = async () => {
    const res = await ChatApi.listConversations();
    setConversations(res.conversations);
  };

  useEffect(() => {
    loadConvos();
    const t = setInterval(loadConvos, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadPresence = async () => {
      try {
        await PresenceApi.ping();
        const o = await PresenceApi.listOnline();
        if (mounted) setOnlineIds(o.onlineIds);
      } catch {}
    };
    const loadMembers = async () => {
      try {
        const res = await UsersApi.list();
        if (mounted) setMembers(res.members);
      } catch {}
    };
    loadMembers();
    loadPresence();
    const t = setInterval(loadPresence, 5000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    if (id) setActive(id);
  }, [id]);

  useEffect(() => {
    if (!active) return;
    let mounted = true;
    async function load() {
      const res = await ChatApi.getConversation(active);
      if (!mounted) return;
      setMessages(res.messages);
      // mark read
      await ChatApi.markRead(active);
    }
    load();
    const t = setInterval(load, 2000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [active]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const startGroup = async () => {
    const name = prompt("Group name") || "Team Chat";
    const res = await ChatApi.createConversation([], true, name);
    nav(`/chat/${res.conversation.id}`);
  };

  const send = async () => {
    if (!active || !text.trim()) return;
    await ChatApi.sendMessage(active, text.trim());
    setText("");
    const res = await ChatApi.getConversation(active);
    setMessages(res.messages);
  };

  const onlineMembers = members.filter((m) => onlineIds.includes(m.id));

  return (
    <div className="flex h-[70vh] rounded-lg overflow-hidden border border-white/10 bg-white/5">
      {/* Left conversations list */}
      <div className="w-1/3 border-r border-white/10 bg-white/5 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Chats</h2>
          <Button size="sm" onClick={startGroup}>New Group</Button>
        </div>
        <div className="flex-1 overflow-auto space-y-2 pr-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`p-2 rounded cursor-pointer hover:bg-white/5 ${active === c.id ? "bg-white/10" : ""}`}
              onClick={() => nav(`/chat/${c.id}`)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name || (c.isGroup ? "Group" : "Conversation")}</div>
                  <div className="text-white/60 text-sm">{c.lastMessage?.text?.slice(0, 80)}</div>
                </div>
                {c.unreadCount > 0 && (
                  <div className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">{c.unreadCount}</div>
                )}
              </div>
            </div>
          ))}
          {conversations.length === 0 && <div className="text-white/60">No conversations.</div>}
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-white/80 mb-2">Online</h3>
          <div className="space-y-1 max-h-40 overflow-auto pr-1">
            {onlineMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span>{m.name} <span className="text-white/50">({m.email})</span></span>
              </div>
            ))}
            {onlineMembers.length === 0 && (
              <div className="text-white/60 text-sm">No one online</div>
            )}
          </div>
        </div>
      </div>

      {/* Right conversation panel */}
      <div className="flex-1 bg-slate-900/60 p-4 flex flex-col">
        <div className="pb-3 mb-3 border-b border-white/10">
          <h2 className="text-lg font-bold">Team Group</h2>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-auto space-y-3 pr-2">
          {messages.map((m) => (
            <div key={m.id} className="p-2 rounded bg-white/5">
              <div className="text-sm text-white/80">{m.fromId || "System"}</div>
              <div className="mt-1">{m.text}</div>
              <div className="text-xs text-white/60 mt-1">{new Date(m.ts).toLocaleString()}</div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-white/60">No messages here yet. Start the conversation!</div>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 rounded px-3 py-2 bg-white/5 border border-white/10 text-white"
            placeholder="Type a message..."
          />
          <Button onClick={send}>Send</Button>
        </div>
      </div>
    </div>
  );
}
