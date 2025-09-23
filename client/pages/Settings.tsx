import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AuthApi, TeamApi, ChatApi } from "@/lib/api";
import type { PublicUser } from "@shared/api";

export default function Settings() {
  const { user, refresh } = useAuth() as any;
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Team management state
  const [members, setMembers] = useState<PublicUser[]>([]);
  const [mName, setMName] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mPassword, setMPassword] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    loadMembers();
  }, [user]);

  const loadMembers = async () => {
    try {
      const res = await TeamApi.list();
      setMembers(res.members);
    } catch {}
  };

  const onSave = async (e?: any) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await AuthApi.updateProfile({ name, password: password || undefined });
      await refresh();
      setPassword("");
      setMessage("Saved");
    } catch (err: any) {
      setMessage(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addMember = async (e: any) => {
    e.preventDefault();
    try {
      await TeamApi.create({ name: mName, email: mEmail, password: mPassword });
      setMName("");
      setMEmail("");
      setMPassword("");
      await loadMembers();
    } catch (err: any) {
      setMessage(err?.message || "Failed to add member");
    }
  };

  const removeMember = async (id: string) => {
    await TeamApi.remove(id);
    await loadMembers();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription className="text-white/70">Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-white/10 text-white border-white/20" required />
              </div>

              <div>
                <Label htmlFor="password" className="text-white">New password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/10 text-white border-white/20" />
                <p className="text-white/60 text-sm mt-1">Leave blank to keep existing password.</p>
              </div>

              <div>
                <Label htmlFor="avatar" className="text-white">Avatar</Label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const data = await new Promise<string>((res, rej) => {
                      const r = new FileReader();
                      r.onload = () => res(String(r.result));
                      r.onerror = rej;
                      r.readAsDataURL(f);
                    });
                    setSaving(true);
                    setMessage(null);
                    try {
                      await AuthApi.updateProfile({ avatarBase64: data });
                      await refresh();
                      setMessage("Avatar uploaded");
                    } catch (err: any) {
                      setMessage(err?.message || "Upload failed");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="block text-sm text-white/70 mt-2"
                />
              </div>

              <div>
                <Label className="text-white">Preferences</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <div className="p-3 rounded bg-white/5 border border-white/10">
                    <div className="font-medium">Notifications</div>
                    <div className="text-white/70 text-sm">Enable desktop notifications for new messages</div>
                  </div>
                  <div className="p-3 rounded bg-white/5 border border-white/10">
                    <div className="font-medium">Theme</div>
                    <div className="text-white/70 text-sm">Use system theme or toggle dark mode from the header</div>
                  </div>
                  <div className="p-3 rounded bg-white/5 border border-white/10">
                    <div className="font-medium">Advanced</div>
                    <div className="text-white/70 text-sm">Manage API access and integrations</div>
                  </div>
                </div>
              </div>

              {message && <div className="text-sm text-white/80">{message}</div>}
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                <Button variant="ghost" onClick={() => { setName(user?.name || ""); setPassword(""); }}>Reset</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
            <CardDescription className="text-white/70">Add or remove team members</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addMember} className="space-y-3 mb-4">
              <div>
                <Label className="text-white">Name</Label>
                <Input value={mName} onChange={(e) => setMName(e.target.value)} className="bg-white/10 text-white border-white/20" required />
              </div>
              <div>
                <Label className="text-white">Email</Label>
                <Input type="email" value={mEmail} onChange={(e) => setMEmail(e.target.value)} className="bg-white/10 text-white border-white/20" required />
              </div>
              <div>
                <Label className="text-white">Password</Label>
                <Input type="password" value={mPassword} onChange={(e) => setMPassword(e.target.value)} className="bg-white/10 text-white border-white/20" required />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Member</Button>
                <Button variant="ghost" onClick={() => { setMName(""); setMEmail(""); setMPassword(""); }}>Reset</Button>
              </div>
            </form>

            <ul className="divide-y divide-white/10">
              {members.map((m) => (
                <li key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-white/60 text-sm">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => ChatApi.createConversation([m.id]).then((r) => window.location.pathname = `/chat/${r.conversation.id}`)}>Chat</Button>
                    <Button variant="destructive" onClick={() => removeMember(m.id)}>Delete</Button>
                  </div>
                </li>
              ))}
              {members.length === 0 && <p className="text-white/60">No members yet.</p>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
