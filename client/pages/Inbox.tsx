import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InboxApi } from "@/lib/api";
import type { Message } from "@shared/api";
import { useAuth } from "@/hooks/useAuth";

export default function Inbox() {
  const { user } = useAuth();
  const [lines, setLines] = useState<Message[]>([]);

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

  const markAllRead = async () => {
    await InboxApi.markRead();
    await load();
  };

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader>
        <CardTitle>Inbox</CardTitle>
        <CardDescription className="text-white/70">
          Lines sent to you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/70 text-sm">Total {lines.length}</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={markAllRead}>
              Mark all read
            </Button>
            <Button variant="secondary" onClick={clear}>
              Clear
            </Button>
          </div>
        </div>
        <div className="space-y-2 max-h-[60vh] overflow-auto pr-2">
          {lines.map((l) => (
            <div
              key={l.id}
              className={`p-2 rounded bg-white/5 border border-white/10 flex justify-between items-start ${l.readBy.includes(user?.id || "") ? "opacity-60" : ""}`}
            >
              <div className="flex-1">
                <div className="text-sm text-white/80">
                  {l.fromId || "System"}
                </div>
                <div className="mt-1 whitespace-pre-wrap">{l.text}</div>
                <div className="text-xs text-white/60 mt-1">
                  {new Date(l.ts).toLocaleString()}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end pl-3">
                {!l.readBy.includes(user?.id || "") && (
                  <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                    New
                  </span>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(l.text);
                      } catch {}
                    }}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const uid = user?.id || "";
                      setLines((prev) =>
                        prev.map((m) =>
                          m.id === l.id
                            ? {
                                ...m,
                                readBy: m.readBy.includes(uid)
                                  ? m.readBy
                                  : [...m.readBy, uid],
                              }
                            : m,
                        ),
                      );
                      try {
                        await InboxApi.markRead([l.id]);
                      } catch {
                        await load();
                      }
                    }}
                  >
                    Mark read
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {lines.length === 0 && (
            <p className="text-white/60">No messages yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
