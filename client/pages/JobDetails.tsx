import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DistributorApi } from "@/lib/api";
import type { Job } from "@shared/api";
import { Button } from "@/components/ui/button";

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    DistributorApi.getJob(id)
      .then((res) => setJob(res.job))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!job) return <div>Job not found</div>;

  // group queue by user
  const grouped: Record<string, any[]> = {};
  const queue = job.queue || [];
  for (const q of queue) {
    if (!grouped[q.userId]) grouped[q.userId] = [];
    grouped[q.userId].push(q);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Job {job.id}</h2>
        <Link to="/jobs">
          <Button variant="ghost">Back</Button>
        </Link>
      </div>
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle>Job details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="text-white/70">Status: {job.status}</div>
            <div className="text-white/70">Lines per tick: {job.linesPerTick}</div>
            <div className="text-white/70">Interval: {job.intervalSec}s</div>
            <div className="text-white/70">Sent: {job.nextIndex}/{job.textLines.length}</div>
          </div>

          <div className="space-y-4">
            {Object.keys(grouped).map((uid) => (
              <div key={uid} className="p-3 rounded bg-white/5 border border-white/10">
                <div className="font-semibold">To: {uid}</div>
                <div className="text-white/70 text-sm">Lines:</div>
                <ol className="mt-2 list-decimal ml-5 space-y-1 text-white/80">
                  {grouped[uid].map((q) => (
                    <li key={q.lineNumber} className={q.status === 'sent' ? 'line-through text-white/50' : ''}>
                      <div className="flex justify-between">
                        <span>{q.line}</span>
                        <span className="text-white/60 text-xs">#{q.lineNumber} {q.status === 'sent' && q.sentAt ? `• ${new Date(q.sentAt).toLocaleString()}` : ''}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
