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
  const [query, setQuery] = useState("");
  const [meta, setMeta] = useState<
    Record<string, { pinned?: boolean; label?: string }>
  >({});

  const loadMeta = () => {
    try {
      const key = `inbox_meta_${(user && user.id) || "guest"}`;
      const raw = localStorage.getItem(key) || "{}";
      setMeta(JSON.parse(raw));
    } catch {
      setMeta({});
    }
  };
  const saveMeta = (m: Record<string, any>) => {
    try {
      const key = `inbox_meta_${(user && user.id) || "guest"}`;
      localStorage.setItem(key, JSON.stringify(m));
      setMeta(m);
    } catch {}
  };

  const load = async () => {
    const res = await InboxApi.get();
    setLines(res.inbox as any);
  };

  useEffect(() => {
    load();
    loadMeta();
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

  const togglePin = (id: string) => {
    const next = { ...meta };
    next[id] = { ...(next[id] || {}), pinned: !next[id]?.pinned };
    saveMeta(next);
  };

  const editLabel = async (id: string) => {
    const current = meta[id]?.label || "";
    const val = window.prompt("Label for message", current);
    if (val === null) return;
    const next = { ...meta };
    next[id] = { ...(next[id] || {}), label: val };
    saveMeta(next);
  };

  const filtered = lines.filter((l) => {
    if (
      query &&
      !l.text.toLowerCase().includes(query.toLowerCase()) &&
      !(meta[l.id]?.label || "").toLowerCase().includes(query.toLowerCase())
    )
      return false;
    return true;
  });

  const pinned = filtered.filter((l) => meta[l.id]?.pinned);
  const regular = filtered.filter((l) => !meta[l.id]?.pinned);

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
          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages or labels"
              className="px-3 py-2 rounded bg-background border border-input text-white/80"
            />
            <p className="text-white/70 text-sm">Total {lines.length}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={markAllRead}>
              Mark all read
            </Button>
            <Button variant="secondary" onClick={clear}>
              Clear
            </Button>
          </div>
        </div>

        {Object.keys(meta).length > 0 &&
          Object.values(meta).some((m) => m.pinned) && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Pinned</h3>
              <div className="space-y-2">
                {lines
                  .filter((l) => meta[l.id]?.pinned)
                  .map((l) => (
                    <div
                      key={`pinned-${l.id}`}
                      className="p-2 rounded bg-white/3 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm text-white/80">
                          {meta[l.id]?.label || l.fromId || "System"}
                        </div>
                        <div className="mt-1 text-white/90">{l.text}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editLabel(l.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePin(l.id)}
                        >
                          Unpin
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        <div className="space-y-2 max-h-[50vh] overflow-auto pr-2">
          {regular.map((l) => (
            <div
              key={l.id}
              className={`p-2 rounded bg-white/5 border border-white/10 flex justify-between items-start ${l.readBy.includes(user?.id || "") ? "opacity-60" : ""}`}
            >
              <div className="flex-1">
                <div className="text-sm text-white/80">
                  {meta[l.id]?.label || l.fromId || "System"}
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
                    onClick={() => editLabel(l.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePin(l.id)}
                  >
                    Pin
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
          {regular.length === 0 && (
            <p className="text-white/60">No messages.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
