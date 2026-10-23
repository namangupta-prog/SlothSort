const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Check, Clock, FileText, FolderOpen, Sparkles, UploadCloud } from "lucide-react";
import StatCard from "@/components/StatCard";
import SlothMark from "@/components/SlothMark";
import ConnectionPill from "@/components/ConnectionPill";
import EmptyState from "@/components/EmptyState";
import FileCard from "@/components/files/FileCard";
import ActivityRow from "@/components/activity/ActivityRow";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [statusRows, categoryRows, filePage, activityPage] = await Promise.all([
          db.entities.FileRecord.aggregate({ groupBy: "status" }),
          db.entities.FileRecord.aggregate({ groupBy: "category" }),
          db.entities.FileRecord.list({ sort: "-created_date", limit: 4 }),
          db.entities.ActivityLog.list({ sort: "-created_date", limit: 4 })
        ]);
        if (!alive) return;
        const map = {};
        (statusRows?.rows || []).forEach((row) => {
          if (row.status) map[row.status] = row.count;
        });
        setCounts(map);
        setCategories(
          (categoryRows?.rows || [])
            .filter((row) => row.category)
            .sort((a, b) => b.count - a.count)
        );
        setFiles(filePage?.items || []);
        setActivity(activityPage?.items || []);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const reviewed = (counts.approved || 0) + (counts.rejected || 0);
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-secondary/80 via-card to-card">
        <CardContent className="flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <SlothMark size={112} variant="mascot" className="animate-sloth-float rounded-3xl" />
          <div className="flex-1 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70">
              Hacktoberfest · Week 3 · Slow and steady
            </p>
            <h1 className="font-display text-2xl leading-tight tracking-tight text-foreground sm:text-3xl">
              Tidy files, one calm step at a time.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Add sample documents, let your own open-weight model suggest a name, category and folder,
              then approve what you like. Nothing is ever moved, renamed or deleted.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button asChild className="rounded-full">
                <Link to="/upload">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Add files
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/review">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Review suggestions
                </Link>
              </Button>
            </div>
            <ConnectionPill />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? [0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-32 rounded-2xl" />)
          : [
              <StatCard
                key="reviewed"
                label="Files reviewed"
                value={reviewed}
                hint="Approved or rejected by you"
                icon={Check}
              />,
              <StatCard
                key="awaiting"
                label="Awaiting review"
                value={counts.suggested || 0}
                hint="Suggestions ready for a decision"
                icon={Clock}
              />,
              <StatCard
                key="categories"
                label="Categories in use"
                value={categories.length}
                hint="Out of seven buckets"
                icon={FolderOpen}
              />,
              <StatCard
                key="total"
                label="In your library"
                value={total}
                hint="Never moved, never deleted"
                icon={FileText}
              />
            ]}
      </div>

      {!loading && total === 0 ? (
        <EmptyState
          icon={UploadCloud}
          title="Your library is empty"
          description="Load the fictional sample set and SlothSort will walk you through a full round of suggestions — safely, with nothing real involved."
        >
          <Button asChild className="rounded-full">
            <Link to="/upload">Add your first files</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-5">
            <Card className="border-border/70">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="font-display text-lg tracking-tight">Recent files</CardTitle>
                <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
                  <Link to="/library">View library</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {files.length ? (
                  files.map((record) => <FileCard key={record.id} record={record} />)
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">No files yet.</p>
                )}
              </CardContent>
            </Card>
            <CategoryBreakdown rows={categories.slice(0, 6)} />
          </div>

          <Card className="h-fit border-border/70">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="font-display text-lg tracking-tight">Recent activity</CardTitle>
              <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
                <Link to="/activity">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.length ? (
                activity.map((entry) => <ActivityRow key={entry.id} entry={entry} />)
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nothing has happened yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}