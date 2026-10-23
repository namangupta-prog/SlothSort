import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_STYLES } from "@/lib/categories";
import { cn } from "@/lib/utils";

export default function CategoryBreakdown({ rows }) {
  if (!rows?.length) return null;
  const total = rows.reduce((sum, row) => sum + row.count, 0) || 1;

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg tracking-tight">Suggested categories</CardTitle>
        <CardDescription>Where your files are heading.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3.5">
        {rows.map((row) => (
          <div key={row.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full border",
                    CATEGORY_STYLES[row.category] || CATEGORY_STYLES.Other
                  )}
                />
                {row.category}
              </span>
              <span className="text-muted-foreground">{row.count}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary/70 transition-all duration-700"
                style={{ width: `${Math.max(6, Math.round((row.count / total) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}