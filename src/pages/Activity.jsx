const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useCallback, useEffect, useState } from "react";

import { History } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ActivityRow from "@/components/activity/ActivityRow";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { undoActivity } from "@/lib/activity";

const PAGE_SIZE = 25;

export default function Activity() {
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const page = await db.entities.ActivityLog.list({
      sort: "-created_date",
      limit: PAGE_SIZE
    });
    setEntries(page.items || []);
    setCursor(page.next_cursor || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const page = await db.entities.ActivityLog.list({
        sort: "-created_date",
        limit: PAGE_SIZE,
        cursor
      });
      setEntries((prev) => [...prev, ...(page.items || [])]);
      setCursor(page.next_cursor || null);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleUndo = async (entry) => {
    setBusyId(entry.id);
    try {
      await undoActivity(entry);
      await load();
      toast({ title: "Change undone" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="History"
        title="Every step, reversible"
        description="A running log of what happened. Approvals and rejections can be undone straight from here."
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : entries.length ? (
        <div className="space-y-3">
          {entries.map((entry) => (
            <ActivityRow
              key={entry.id}
              entry={entry}
              busy={busyId === entry.id}
              onUndo={handleUndo}
            />
          ))}
          {cursor ? (
            <div className="pt-2 text-center">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState
          icon={History}
          title="No history yet"
          description="Once you add files and make decisions, every action shows up here — ready to undo."
        />
      )}
    </div>
  );
}