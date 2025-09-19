import { useEffect, useState, useRef } from "react";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatApi, TeamApi } from "@/lib/api";
import type { ConversationSummary, Message, PublicUser } from "@shared/api";
import { useNavigate, useParams } from "react-router-dom";

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [members, setMembers] = useState<PublicUser[]>([]);
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
  const loadMembers = async () => {
    const res = await TeamApi.list();
    setMembers(res.members);
  };

  useEffect(() => { loadConvos(); loadMembers(); const t = setInterval(loadConvos, 3000); return () => clearInterval(t); }, []);

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
    return () => { mounted = false; clearInterval(t); };
  }, [active]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const openOrCreate1to1 = async (memberId: string) => {
    // Try find existing convo
    const meConvs = conversations.filter((c) => !c.isGroup);
    const found = meConvs.find((c) => c.participantIds.includes(memberId));
    if (found) {
      nav(`/chat/${found.id}`);
      return;
    }
    const res = await ChatApi.createConversation([memberId], false);
    nav(`/chat/${res.conversation.id}`);
  };

  const openOrCreateGroup = async () => {
    // find group named Team Group
    const found = conversations.find((c) => c.isGroup && (c.name || '').toLowerCase().includes('team'));
    if (found) { nav(`/chat/${found.id}`); return; }
    const res = await ChatApi.createConversation([], true, 'Team Group');
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
    <div className="grid lg:grid-cols-4 gap-6 h-[70vh]">
      <Card className="col-span-1 bg-white/5 border-white/10 text-white overflow-auto">
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <Button onClick={openOrCreateGroup} className="w-full">Team Group</Button>
          </div>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className={`p-2 rounded cursor-pointer hover:bg-white/5 ${active && conversations.find(c => c.id === active && c.participantIds.includes(m.id)) ? 'bg-white/5' : ''}`} onClick={() => openOrCreate1to1(m.id)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-white/60 text-sm">{m.email}</div>
                  </div>
                  {m.unreadCount > 0 && <div className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">{m.unreadCount}</div>}
                </div>
              </div>
            ))}
            {members.length === 0 && <div className="text-white/60">No contacts.</div>}
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-3">
        <Card className="bg-white/5 border-white/10 text-white h-full flex flex-col">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div ref={scrollRef} className="max-h-[60vh] overflow-auto space-y-3 p-2">
              {messages.map((m) => (
                <div key={m.id} className="p-2 rounded bg-white/5">
                  <div className="text-sm text-white/80">{m.fromId || 'System'}</div>
                  <div className="mt-1">{m.text}</div>
                  <div className="text-xs text-white/60 mt-1">{new Date(m.ts).toLocaleString()}</div>
                </div>
              ))}
              {messages.length === 0 && <div className="text-white/60">No messages selected.</div>}
            </div>
          </CardContent>
          <div className="p-4">
            <div className="mt-4 flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded px-3 py-2 bg-white/5 border border-white/10 text-white" placeholder="Type a message..." />
              <Button onClick={send}>Send</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
