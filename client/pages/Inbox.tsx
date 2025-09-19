import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InboxApi } from "@/lib/api";

export default function Inbox() {
  const [lines, setLines] = useState<string[]>([]);

  const load = async () => {
    const res = await InboxApi.get();
    setLines(res.inbox);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  const clear = async () => {
    await InboxApi.clear();
    await load();
  };

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader>
        <CardTitle>Inbox</CardTitle>
        <CardDescription className="text-white/70">Lines sent to you</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/70 text-sm">Total {lines.length}</p>
          <Button variant="secondary" onClick={clear}>Clear</Button>
        </div>
        <div className="space-y-2 max-h-[60vh] overflow-auto pr-2">
          {lines.map((l, i) => (
            <div key={i} className="p-2 rounded bg-white/5 border border-white/10">{l}</div>
          ))}
          {lines.length === 0 && <p className="text-white/60">No messages yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
