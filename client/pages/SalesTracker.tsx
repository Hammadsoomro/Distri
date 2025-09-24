import React, { useEffect, useMemo, useState } from "react";
import { TeamApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SalesTiers = {
  silver: number;
  gold: number;
  platinum: number;
  diamond: number;
  ruby: number;
  sapphire: number;
};

type MemberSales = {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
  tiers: SalesTiers;
  today: number;
  week: number;
  month: number;
};

function makeDeterministicNumber(seed: string, mod = 100) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h % mod;
}

export default function SalesTracker() {
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberSales[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "admin";
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localEdits, setLocalEdits] = useState<Record<string, MemberSales>>({});

  useEffect(() => {
    let mounted = true;
    TeamApi.list()
      .then((res) => {
        const ms = (res.members || []).map((m: any) => {
          const seed = String(m.id || m.email || m.name || Math.random());
          const tiers: SalesTiers = {
            silver: makeDeterministicNumber(seed + "silver", 120),
            gold: makeDeterministicNumber(seed + "gold", 80),
            platinum: makeDeterministicNumber(seed + "platinum", 40),
            diamond: makeDeterministicNumber(seed + "diamond", 20),
            ruby: makeDeterministicNumber(seed + "ruby", 10),
            sapphire: makeDeterministicNumber(seed + "sapphire", 6),
          };
          const today = makeDeterministicNumber(seed + "today", 5000);
          const week = makeDeterministicNumber(seed + "week", 20000);
          const month = makeDeterministicNumber(seed + "month", 80000);
          return {
            id: m.id,
            name: m.name || m.email || "Unknown",
            email: m.email,
            avatar: (m as any).avatar || null,
            tiers,
            today,
            week,
            month,
          } as MemberSales;
        });
        if (mounted) setMembers(ms);
      })
      .catch(() => {
        // fallback: empty list
        if (mounted) setMembers([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const startEdit = (m: MemberSales) => {
    setLocalEdits((s) => ({ ...s, [m.id]: { ...m } }));
    setEditingId(m.id);
  };

  const cancelEdit = (id: string) => {
    setLocalEdits((s) => {
      const copy = { ...s };
      delete copy[id];
      return copy;
    });
    setEditingId((cur) => (cur === id ? null : cur));
  };

  const saveEdit = (id: string) => {
    const edited = localEdits[id];
    if (!edited) {
      setEditingId(null);
      return;
    }
    setMembers((prev) => prev.map((m) => (m.id === id ? edited : m)));
    setEditingId(null);
    setLocalEdits((s) => {
      const c = { ...s };
      delete c[id];
      return c;
    });
    try {
      // For now we only persist locally. Integration with backend can be added later.
      // Notify the user briefly
      // eslint-disable-next-line no-alert
      alert("Sales saved (local only). Connect a backend to persist changes.");
    } catch {}
  };

  const updateLocalField = (
    id: string,
    path: keyof MemberSales | (keyof SalesTiers & string),
    value: string | number,
  ) => {
    setLocalEdits((s) => {
      const base = s[id] || members.find((m) => m.id === id)!;
      if (!base) return s;
      const copy: MemberSales = JSON.parse(JSON.stringify(base));
      if (path === "today" || path === "week" || path === "month") {
        (copy as any)[path] = Number(value) || 0;
      } else if (
        ["silver", "gold", "platinum", "diamond", "ruby", "sapphire"].includes(path)
      ) {
        (copy as any).tiers[path] = Number(value) || 0;
      }
      return { ...s, [id]: copy };
    });
  };

  const visibleMembers = useMemo(() => members, [members]);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales tracker</h1>
        <div className="text-sm text-white/70">Visible to admins and team members — edit only for admins</div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleMembers.length === 0 && <div className="text-white/60">No team members found.</div>}
        {visibleMembers.map((m) => {
          const editing = editingId === m.id && isAdmin;
          const local = localEdits[m.id] || m;
          const total =
            local.today + local.week + local.month +
            Object.values(local.tiers).reduce((a, b) => a + b, 0);

          return (
            <Card key={m.id} className="bg-white/5 border-white/10 text-white p-0 overflow-hidden">
              <CardHeader className="p-4 text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-accent grid place-items-center text-xl font-bold text-white">
                  {m.name
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <CardTitle className="mt-3 text-base">{m.name}</CardTitle>
                <div className="text-white/60 text-xs">{m.email}</div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Sales</h3>
                  {isAdmin && (
                    <div className="flex gap-2">
                      {!editing ? (
                        <Button size="sm" onClick={() => startEdit(m)}>
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => cancelEdit(m.id)}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => saveEdit(m.id)}>
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  {(["silver", "gold", "platinum", "diamond", "ruby", "sapphire"] as (keyof SalesTiers)[]).map((k) => (
                    <div key={k} className="p-2 bg-white/2 rounded">
                      <div className="text-xs text-white/70 capitalize">{k}</div>
                      {!editing ? (
                        <div className="text-lg font-semibold">{(local.tiers as any)[k].toLocaleString()}</div>
                      ) : (
                        <Input
                          value={String((local.tiers as any)[k])}
                          onChange={(e) => updateLocalField(m.id, k as any, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-2 border-t border-white/6 pt-3 space-y-3">
                  <div>
                    <div className="text-sm text-white/70">Sales of today</div>
                    {!editing ? (
                      <div className="text-lg font-semibold">{local.today.toLocaleString()}</div>
                    ) : (
                      <Input value={String(local.today)} onChange={(e) => updateLocalField(m.id, "today", e.target.value)} />
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-white/70">Sales of Week</div>
                    {!editing ? (
                      <div className="text-lg font-semibold">{local.week.toLocaleString()}</div>
                    ) : (
                      <Input value={String(local.week)} onChange={(e) => updateLocalField(m.id, "week", e.target.value)} />
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-white/70">Sales of Month</div>
                    {!editing ? (
                      <div className="text-lg font-semibold">{local.month.toLocaleString()}</div>
                    ) : (
                      <Input value={String(local.month)} onChange={(e) => updateLocalField(m.id, "month", e.target.value)} />
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between">
                <div className="font-semibold">Total</div>
                <div className="text-lg font-extrabold">{total.toLocaleString()}</div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
