import { Check, Download, History, ListChecks, Sparkles, Undo2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import moment from "moment";

const ACTION_META = {
  upload: { Icon: UploadCloud, tone: "bg-secondary text-primary" },
  sample: { Icon: Sparkles, tone: "bg-secondary text-primary" },
  suggest: { Icon: ListChecks, tone: "bg-amber-50 text-amber-700" },
  approve: { Icon: Check, tone: "bg-emerald-50 text-emerald-700" },
  reject: { Icon: X, tone: "bg-rose-50 text-rose-700" },
  undo: { Icon: Undo2, tone: "bg-secondary text-primary" },
  export: { Icon: Download, tone: "bg-secondary text-primary" }
};

export default function ActivityRow({ entry, onUndo, busy }) {
  const meta = ACTION_META[entry.action] || { Icon: History, tone: "bg-secondary text-primary" };
  const Icon = meta.Icon;
  const canUndo = Boolean(onUndo) && !entry.undone && (entry.action === "approve" || entry.action === "reject");

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3.5",
        entry.undone && "opacity-60"
      )}
    >
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", meta.tone)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{entry.title}</p>
        {entry.detail ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{entry.detail}</p>
        ) : null}
        <p className="mt-1 text-[11px] text-muted-foreground">
          {entry.created_date ? moment(entry.created_date).fromNow() : ""}
          {entry.undone ? " · undone" : ""}
        </p>
      </div>
      {canUndo ? (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 rounded-full text-xs"
          disabled={busy}
          onClick={() => onUndo(entry)}
        >
          <Undo2 className="mr-1.5 h-3.5 w-3.5" />
          Undo
        </Button>
      ) : null}
    </div>
  );
}