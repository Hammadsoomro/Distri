import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AuthApi } from "@/lib/api";

export default function Settings() {
  const { user, refresh } = useAuth() as any;
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name || "");
  }, [user]);

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

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription className="text-white/70">
            Manage your account settings
          </CardDescription>
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
  );
}
