import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatApi, PresenceApi, UsersApi } from "@/lib/api";
import type { ConversationSummary, Message } from "@shared/api";
import { useNavigate, useParams } from "react-router-dom";

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
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

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      <Card className="col-span-1 bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Button onClick={startGroup}>New Group</Button>
            {conversations.map((c) => (
              <div
                key={c.id}
                className={`p-2 rounded cursor-pointer hover:bg-white/5 ${active === c.id ? "bg-white/5" : ""}`}
                onClick={() => nav(`/chat/${c.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {c.name || (c.isGroup ? "Group" : "Conversation")}
                    </div>
                    <div className="text-white/60 text-sm">
                      {c.lastMessage?.text?.slice(0, 80)}
                    </div>
                  </div>
                  {c.unreadCount > 0 && (
                    <div className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                      {c.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="text-white/60">No conversations.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-3">
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={scrollRef}
              className="max-h-[60vh] overflow-auto space-y-3 p-2"
            >
              {messages.map((m) => (
                <div key={m.id} className="p-2 rounded bg-white/5">
                  <div className="text-sm text-white/80">
                    {m.fromId || "System"}
                  </div>
                  <div className="mt-1">{m.text}</div>
                  <div className="text-xs text-white/60 mt-1">
                    {new Date(m.ts).toLocaleString()}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-white/60">No messages selected.</div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
