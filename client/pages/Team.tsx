import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TeamApi, ChatApi } from "@/lib/api";
import type { PublicUser } from "@shared/api";
import { useNavigate } from "react-router-dom";

export default function Team() {
  const [members, setMembers] = useState<PublicUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  const load = async () => {
    const res = await TeamApi.list();
    setMembers(res.members);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await TeamApi.create({ name, email, password });
      setName("");
      setEmail("");
      setPassword("");
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to add member");
    }
  };

  const remove = async (id: string) => {
    await TeamApi.remove(id);
    await load();
  };

  const startChat = async (memberId: string) => {
    // create a 1-on-1 conversation including current admin and the member
    const res = await ChatApi.createConversation([memberId], false);
    const conv = res.conversation;
    nav(`/chat/${conv.id}`);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle>New Team Member</CardTitle>
          <CardDescription className="text-white/70">
            Set name, email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={add} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 text-white border-white/20"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 text-white border-white/20"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 text-white border-white/20"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit">Add Member</Button>
          </form>
        </CardContent>
      </Card>
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription className="text-white/70">
            Total {members.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-white/10">
            {members.map((m) => (
              <li key={m.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium flex items-center gap-3">
                    {m.name}
                    {m.unreadCount > 0 && (
                      <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                        {m.unreadCount}
                      </span>
                    )}
                  </p>
                  <p className="text-white/60 text-sm">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => startChat(m.id)}>Chat</Button>
                  <Button variant="destructive" onClick={() => remove(m.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
            {members.length === 0 && (
              <p className="text-white/60">No members yet.</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
