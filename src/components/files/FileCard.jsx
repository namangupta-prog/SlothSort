import { Archive, File as FileIcon, FileText, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SourceBadge from "@/components/SourceBadge";
import { CATEGORY_STYLES, STATUS_META } from "@/lib/categories";
import { extensionOf, formatBytes } from "@/lib/fileUtils";
import { cn } from "@/lib/utils";
import moment from "moment";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "heic", "svg", "bmp"];
const ARCHIVE_EXTENSIONS = ["zip", "rar", "7z", "tar", "gz", "dmg", "pkg", "exe"];
const DOC_EXTENSIONS = ["pdf", "doc", "docx", "txt", "md", "rtf", "odt"];

function iconFor(record) {
  const mime = String(record.file_type || "").toLowerCase();
  const extension = extensionOf(record.filename);
  if (mime.startsWith("image/") || IMAGE_EXTENSIONS.includes(extension)) return ImageIcon;
  if (ARCHIVE_EXTENSIONS.includes(extension)) return Archive;
  if (mime.startsWith("text/") || DOC_EXTENSIONS.includes(extension)) return FileText;
  return FileIcon;
}

export default function FileCard({ record, children }) {
  const Icon = iconFor(record);
  const status = STATUS_META[record.status] || STATUS_META.new;

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/30 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{record.filename}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {record.file_type || `${extensionOf(record.filename).toUpperCase() || "Unknown"} file`} ·{" "}
              {formatBytes(record.file_size)}
              {record.is_sample ? " · fictional sample" : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {record.status !== "new" ? (
            <Badge variant="outline" className={cn("rounded-full text-[11px] font-semibold", status.style)}>
              {status.label}
            </Badge>
          ) : null}
          {record.category ? (
            <Badge
              variant="outline"
              className={cn(
                "rounded-full text-[11px] font-semibold",
                CATEGORY_STYLES[record.category] || CATEGORY_STYLES.Other
              )}
            >
              {record.category}
            </Badge>
          ) : null}
        </div>
      </div>

      {record.suggested_filename ? (
        <div className="mt-3 rounded-xl bg-secondary/50 px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Suggested name
          </p>
          <p className="text-sm font-medium text-foreground">{record.suggested_filename}</p>
          {record.destination_folder ? (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Folder · <span className="font-medium text-foreground/80">{record.destination_folder}</span>
            </p>
          ) : null}
          {record.explanation ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{record.explanation}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SourceBadge source={record.ai_source} model={record.ai_model} />
            {typeof record.confidence === "number" ? (
              <span className="text-[11px] text-muted-foreground">
                {Math.round(record.confidence * 100)}% confidence
              </span>
            ) : null}
            {record.status === "approved" && record.reviewed_date ? (
              <span className="text-[11px] text-muted-foreground">
                approved {moment(record.reviewed_date).fromNow()}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {children ? <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}