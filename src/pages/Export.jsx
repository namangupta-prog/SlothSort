const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Download, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { buildCsv, buildJson, download } from "@/lib/exportPlan";
import { logActivity } from "@/lib/activity";

export default function Export() {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const page = await db.entities.FileRecord.filter(
          { status: "approved" },
          { sort: "-reviewed_date", limit: 200 }
        );
        if (alive) setRecords(page.items || []);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const handleDownload = async (format) => {
    setBusy(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      const content = format === "json" ? buildJson(records) : buildCsv(records);
      download(
        content,
        `slothsort-plan-${stamp}.${format}`,
        format === "json" ? "application/json" : "text/csv"
      );
      await logActivity({
        action: "export",
        title: `Exported ${records.length} approved suggestion${records.length === 1 ? "" : "s"} as ${format.toUpperCase()}`,
        detail: "A plan only — no file was moved, renamed or deleted."
      });
      toast({ title: `Plan downloaded as ${format.toUpperCase()}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 3"
        title="Take the plan with you"
        description="Only suggestions you approved are included. SlothSort hands you a plan — you decide whether to act on it."
      />

      {loading ? (
        <Skeleton className="h-56 w-full rounded-3xl" />
      ) : records.length ? (
        <>
          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg tracking-tight">
                {records.length} approved suggestion{records.length === 1 ? "" : "s"}
              </CardTitle>
              <CardDescription>
                Each row maps an original filename to its suggested name and folder.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {records.slice(0, 6).map((record) => (
                <div
                  key={record.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/50 px-3.5 py-2.5 text-sm"
                >
                  <span className="truncate font-medium text-muted-foreground">{record.filename}</span>
                  <span className="truncate font-medium text-foreground">
                    {record.suggested_filename} · {record.destination_folder}
                  </span>
                </div>
              ))}
              {records.length > 6 ? (
                <p className="pt-1 text-xs text-muted-foreground">
                  and {records.length - 6} more in the download.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Downloading creates a file on your device. Nothing is moved, renamed or deleted here,
                  and nobody receives the plan until you choose to send it.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-secondary/50 px-3.5 py-3">
                <Checkbox
                  id="confirm-plan"
                  checked={confirmed}
                  onCheckedChange={(value) => setConfirmed(Boolean(value))}
                />
                <Label htmlFor="confirm-plan" className="cursor-pointer text-sm leading-snug">
                  I've reviewed and approved these suggestions and want to export the plan.
                </Label>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="rounded-full"
                  disabled={!confirmed || busy}
                  onClick={() => handleDownload("json")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={!confirmed || busy}
                  onClick={() => handleDownload("csv")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>
              {!confirmed ? (
                <p className="text-xs text-muted-foreground">
                  Tick the box above to enable the download buttons.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg tracking-tight">Preview</CardTitle>
              <CardDescription>The first entries, exactly as they'll download.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-72 overflow-auto rounded-2xl bg-secondary/50 p-4 text-xs leading-relaxed text-foreground/80">
                {buildJson(records.slice(0, 2))}
              </pre>
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={Download}
          title="Nothing approved yet"
          description="Head to the review queue and approve a few suggestions — then they'll be ready to export as a plan."
        >
          <Button asChild className="rounded-full">
            <Link to="/review">Open the review queue</Link>
          </Button>
        </EmptyState>
      )}
    </div>
  );
}