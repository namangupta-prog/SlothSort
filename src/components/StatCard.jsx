import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <Card className="border-border/70 bg-card/80 transition-transform duration-300 hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </span>
          {Icon ? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
        </div>
        <p className="mt-3 font-display text-3xl tracking-tight text-foreground">{value}</p>
        {hint ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}