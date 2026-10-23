const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AlertTriangle, Loader2, ShieldCheck, Sparkles, UploadCloud, Wand2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import DemoBanner from "@/components/DemoBanner";
import UploadDropzone from "@/components/files/UploadDropzone";
import FileCard from "@/components/files/FileCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { SAMPLE_FILES } from "@/lib/sampleFiles";
import { buildSearchName, readExcerpt } from "@/lib/fileUtils";
import { demoSuggest } from "@/lib/demoSuggest";
import { analyzeFiles, describeError, isConfigured } from "@/lib/ollama";
import { loadConfig } from "@/lib/ollamaConfig";
import { logActivity } from "@/lib/activity";

export default function Upload() {
  const { toast } = useToast();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [demoNotice, setDemoNotice] = useState("");

  const loadPending = useCallback(async () => {
    const page = await db.entities.FileRecord.filter(
      { status: "new" },
      { sort: "-created_date", limit: 100 }
    );
    setPending(page.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const addFiles = async (files) => {
    setUploading(true);
    setError("");
    try {
      const created = [];
      for (const file of files) {
        const excerpt = await readExcerpt(file);
        const { file_uri } = await db.integrations.Core.UploadPrivateFile({ file });
        created.push({
          filename: file.name,
          search_name: buildSearchName(file.name),
          file_type: file.type || "unknown",
          file_size: file.size,
          file_uri,
          excerpt,
          is_sample: false,
          status: "new"
        });
      }
      await db.entities.FileRecord.bulkCreate(created);
      await logActivity({
        action: "upload",
        title: `Added ${created.length} file${created.length === 1 ? "" : "s"}`,
        detail: created.map((item) => item.filename).slice(0, 4).join(", ")
      });
      toast({ title: `${created.length} file${created.length === 1 ? "" : "s"} added` });
    } catch (err) {
      setError(err?.message || "Those files couldn't be added.");
    } finally {
      setUploading(false);
      await loadPending();
    }
  };

  const addSamples = async () => {
    setError("");
    const records = SAMPLE_FILES.map((sample) => ({
      filename: sample.filename,
      search_name: buildSearchName(sample.filename),
      file_type: sample.file_type,
      file_size: sample.file_size,
      excerpt: "",
      is_sample: true,
      status: "new"
    }));
    await db.entities.FileRecord.bulkCreate(records);
    await logActivity({
      action: "sample",
      title: `Loaded ${records.length} fictional sample files`,
      detail: "These are made-up files with no real contents, so you can try the whole flow safely."
    });
    toast({ title: "Sample files loaded" });
    await loadPending();
  };

  const applySuggestions = async (payload, suggestions, meta) => {
    const byId = new Map(suggestions.map((item) => [String(item.id), item]));
    const updates = payload.map((file) => {
      const suggestion = byId.get(String(file.id)) || demoSuggest(file);
      const update = {
        id: file.id,
        status: "suggested",
        suggested_filename: suggestion.suggested_filename,
        category: suggestion.category,
        destination_folder: suggestion.destination_folder,
        explanation: suggestion.explanation,
        ai_source: meta.source,
        ai_model: meta.model,
        suggested_date: new Date().toISOString(),
        search_name: buildSearchName(
          file.filename,
          suggestion.suggested_filename,
          suggestion.category,
          suggestion.destination_folder
        )
      };
      if (typeof suggestion.confidence === "number") update.confidence = suggestion.confidence;
      return update;
    });
    await db.entities.FileRecord.bulkUpdate(updates);
    await logActivity({
      action: "suggest",
      title: `Suggested organization for ${updates.length} file${updates.length === 1 ? "" : "s"}`,
      detail:
        meta.source === "model"
          ? `Generated by ${meta.model}.`
          : "Generated by SlothSort's built-in demo rules — no model was connected.",
      source: meta.source
    });
  };

  const runAnalysis = async (useDemo) => {
    if (!pending.length) return;
    setAnalyzing(true);
    setError("");
    setDemoNotice("");
    const config = loadConfig();
    const payload = pending.map((record) => ({
      id: record.id,
      filename: record.filename,
      file_type: record.file_type,
      file_size: record.file_size,
      excerpt: record.excerpt || ""
    }));
    try {
      if (useDemo || !isConfigured(config)) {
        await applySuggestions(payload, payload.map(demoSuggest), {
          source: "demo",
          model: "Demo rules (no model connected)"
        });
        setDemoNotice(
          "Demo mode: no model is connected, so these suggestions come from SlothSort's own rules — they are not model output."
        );
      } else {
        const suggestions = await analyzeFiles(payload, config);
        await applySuggestions(payload, suggestions, { source: "model", model: config.model });
        toast({
          title: `Suggestions ready for ${payload.length} file${payload.length === 1 ? "" : "s"}`
        });
      }
    } catch (err) {
      setError(describeError(err, config.endpoint));
    } finally {
      setAnalyzing(false);
      await loadPending();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 1"
        title="Add the files you want to sort"
        description="Drop in real sample documents, or load the fictional set. SlothSort only ever suggests names and folders — nothing is moved, renamed or deleted."
      >
        <Button variant="outline" className="rounded-full" onClick={addSamples}>
          <Sparkles className="mr-2 h-4 w-4" />
          Load sample files
        </Button>
      </PageHeader>

      <UploadDropzone onFiles={addFiles} busy={uploading} busyLabel="Uploading…" />

      <Card className="border-border/70 bg-card/70">
        <CardContent className="flex items-start gap-3 p-4 text-sm leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>
            Uploaded files are <span className="font-medium text-foreground">stored privately</span> in
            this app. When you ask for suggestions, only the file name, type, size and — for plain-text
            files — a short text excerpt are sent to the model endpoint you save in Settings. Images and
            archives are never read.
          </p>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>The model connection didn't answer</AlertTitle>
          <AlertDescription className="space-y-3">
            <p className="leading-relaxed">{error}</p>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => runAnalysis(true)}
            >
              Use demo suggestions instead
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {demoNotice ? <DemoBanner>{demoNotice}</DemoBanner> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Waiting for suggestions</h2>
          <p className="text-sm text-muted-foreground">
            {pending.length
              ? `${pending.length} file${pending.length === 1 ? "" : "s"} ready to be looked at.`
              : "Nothing waiting right now."}
          </p>
        </div>
        {pending.length ? (
          <Button className="rounded-full" onClick={() => runAnalysis(false)} disabled={analyzing}>
            {analyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {analyzing ? "Thinking…" : "Suggest with AI"}
          </Button>
        ) : null}
      </div>

      {loading ? (
        <Skeleton className="h-28 w-full rounded-2xl" />
      ) : pending.length ? (
        <div className="space-y-3">
          {pending.map((record) => (
            <FileCard key={record.id} record={record} />
          ))}
          <p className="pt-1 text-center text-sm text-muted-foreground">
            Added everything?{" "}
            <Link to="/review" className="font-semibold text-primary underline-offset-4 hover:underline">
              Go to the review queue
            </Link>
          </p>
        </div>
      ) : (
        <EmptyState
          icon={UploadCloud}
          title="No files waiting"
          description="Drop a file above or load the fictional sample set to see how the whole flow works."
        />
      )}
    </div>
  );
}