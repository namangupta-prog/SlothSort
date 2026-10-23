const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useCallback, useEffect, useState } from "react";

import { FolderOpen, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import FileCard from "@/components/files/FileCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { CATEGORIES, STATUS_META } from "@/lib/categories";
import { escapeRegex } from "@/lib/fileUtils";

const PAGE_SIZE = 30;

export default function Library() {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [records, setRecords] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const buildQuery = useCallback(() => {
    const query = {};
    if (category !== "all") query.category = category;
    if (status !== "all") query.status = status;
    const trimmed = term.trim();
    if (trimmed) query.search_name = { $regex: escapeRegex(trimmed.toLowerCase()) };
    return query;
  }, [term, category, status]);

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const page = await db.entities.FileRecord.filter(buildQuery(), {
          sort: "-created_date",
          limit: PAGE_SIZE
        });
        if (!alive) return;
        setRecords(page.items || []);
        setCursor(page.next_cursor || null);
      } finally {
        if (alive) setLoading(false);
      }
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [buildQuery]);

  const loadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const page = await db.entities.FileRecord.filter(buildQuery(), {
        sort: "-created_date",
        limit: PAGE_SIZE,
        cursor
      });
      setRecords((prev) => [...prev, ...(page.items || [])]);
      setCursor(page.next_cursor || null);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library"
        title="Everything SlothSort has looked at"
        description="Search by file or suggested name, then narrow down by category or decision."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search files and suggested names…"
            className="h-11 rounded-full pl-10"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-11 rounded-full sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-11 rounded-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            {Object.entries(STATUS_META).map(([value, meta]) => (
              <SelectItem key={value} value={value}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : records.length ? (
        <div className="space-y-3">
          {records.map((record) => (
            <FileCard key={record.id} record={record} />
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
          icon={FolderOpen}
          title="No files match that"
          description="Try a different search term, or clear the filters to see everything."
        />
      )}
    </div>
  );
}