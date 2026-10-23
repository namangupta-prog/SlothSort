import { Check, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SourceBadge from "@/components/SourceBadge";
import { CATEGORY_STYLES } from "@/lib/categories";
import { formatBytes } from "@/lib/fileUtils";
import { cn } from "@/lib/utils";

export default function ReviewCard({ record, pending, onApprove, onReject }) {
  const busy = Boolean(pending);

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Was
          </p>
          <p className="truncate text-sm font-medium text-muted-foreground line-through decoration-border">
            {record.filename}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "rounded-full text-[11px] font-semibold",
            CATEGORY_STYLES[record.category] || CATEGORY_STYLES.Other
          )}
        >
          {record.category || "Other"}
        </Badge>
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Becomes
        </p>
        <p className="font-display text-lg leading-snug tracking-tight text-foreground">
          {record.suggested_filename}
        </p>
      </div>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-secondary/50 px-3.5 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Folder
          </p>
          <p className="font-medium text-foreground">{record.destination_folder || "—"}</p>
        </div>
        <div className="rounded-xl bg-secondary/50 px-3.5 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Type &amp; size
          </p>
          <p className="font-medium text-foreground">
            {record.file_type || "unknown"} · {formatBytes(record.file_size)}
          </p>
        </div>
      </div>

      {record.explanation ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{record.explanation}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SourceBadge source={record.ai_source} model={record.ai_model} />
          {record.is_sample ? (
            <span className="text-[11px] text-muted-foreground">Fictional sample file</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={busy}
            onClick={() => onReject(record)}
          >
            {pending === "reject" ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-1.5 h-4 w-4" />
            )}
            Reject
          </Button>
          <Button size="sm" className="rounded-full" disabled={busy} onClick={() => onApprove(record)}>
            {pending === "approve" ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-1.5 h-4 w-4" />
            )}
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}