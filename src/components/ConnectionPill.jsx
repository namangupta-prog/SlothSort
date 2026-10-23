import { Link } from "react-router-dom";
import { AlertTriangle, Check, Loader2, Plug } from "lucide-react";
import useConnection from "@/hooks/useConnection";
import { cn } from "@/lib/utils";

const STATES = {
  connected: {
    label: "Model connected",
    Icon: Check,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800"
  },
  unconfigured: {
    label: "Demo mode",
    Icon: Plug,
    tone: "border-amber-200 bg-amber-50 text-amber-800"
  },
  checking: {
    label: "Checking connection",
    Icon: Loader2,
    tone: "border-border bg-secondary text-muted-foreground"
  },
  error: {
    label: "Not connected",
    Icon: AlertTriangle,
    tone: "border-rose-200 bg-rose-50 text-rose-800"
  }
};

export default function ConnectionPill({ compact = false }) {
  const { status, message } = useConnection();
  const state = STATES[status] || STATES.unconfigured;
  const Icon = state.Icon;

  return (
    <div className="space-y-2">
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
          state.tone
        )}
      >
        <Icon className={cn("h-3.5 w-3.5", status === "checking" && "animate-spin")} />
        {state.label}
      </span>
      {!compact && message ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{message}</p>
      ) : null}
      {!compact && status !== "connected" ? (
        <Link
          to="/settings"
          className="inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline"
        >
          Configure the model connection
        </Link>
      ) : null}
    </div>
  );
}