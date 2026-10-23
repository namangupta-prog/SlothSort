import { Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SourceBadge({ source, model, className = "" }) {
  const fromModel = source === "model";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        fromModel
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700",
        className
      )}
    >
      {fromModel ? <Sparkles className="h-3 w-3" /> : <Info className="h-3 w-3" />}
      {fromModel ? `Model · ${model || "connected"}` : "Demo data"}
    </span>
  );
}