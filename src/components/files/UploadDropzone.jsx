import { useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UploadDropzone({ onFiles, busy = false, busyLabel = "Working…" }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length) onFiles(files);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-colors",
        dragging
          ? "border-primary bg-accent/60"
          : "border-border bg-card/60 hover:border-primary/50 hover:bg-secondary/50"
      )}
    >
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
          dragging ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
        )}
      >
        {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
      </span>
      <p className="font-display text-lg tracking-tight text-foreground">
        {busy ? busyLabel : "Drop files here"}
      </p>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        or click to browse. SlothSort reads the name, type and size — and only looks inside plain-text
        files.
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files || []);
          if (files.length) onFiles(files);
          event.target.value = "";
        }}
      />
    </div>
  );
}