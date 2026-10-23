import { useState } from "react";
import { AlertTriangle, Check, Info, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useConnection from "@/hooks/useConnection";
import { loadConfig, saveConfig } from "@/lib/ollamaConfig";

const STATUS_STYLES = {
  connected: { label: "Connected", tone: "border-emerald-200 bg-emerald-50 text-emerald-800", Icon: Check },
  unconfigured: { label: "Not connected — demo mode", tone: "border-amber-200 bg-amber-50 text-amber-800", Icon: Info },
  checking: { label: "Checking…", tone: "border-border bg-secondary text-muted-foreground", Icon: Loader2 },
  error: { label: "Can't reach the endpoint", tone: "border-rose-200 bg-rose-50 text-rose-800", Icon: AlertTriangle }
};

export default function Settings() {
  const { status, message, checking, refresh } = useConnection();
  const [config, setConfig] = useState(() => loadConfig());
  const [saved, setSaved] = useState(false);

  const state = STATUS_STYLES[status] || STATUS_STYLES.unconfigured;
  const StateIcon = state.Icon;

  const updateField = (key) => (event) =>
    setConfig((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSave = (event) => {
    event.preventDefault();
    saveConfig(config);
    setSaved(true);
    refresh(config);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Bring your own open-weight model"
        description="SlothSort talks to any Ollama-compatible endpoint. Point it at your own machine and your files never pass through a hosted AI service."
      />

      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg tracking-tight">Connection</CardTitle>
          <CardDescription>
            Saved in this browser only — the requests go straight from your browser to your endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${state.tone}`}
          >
            <StateIcon className={`mt-0.5 h-4 w-4 shrink-0 ${checking ? "animate-spin" : ""}`} />
            <div>
              <p className="font-semibold">{state.label}</p>
              {message ? <p className="mt-0.5 leading-relaxed opacity-90">{message}</p> : null}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint address</Label>
              <Input
                id="endpoint"
                value={config.endpoint}
                onChange={updateField("endpoint")}
                placeholder="http://localhost:11434"
                autoComplete="off"
                className="h-11 rounded-2xl"
              />
              <p className="text-xs text-muted-foreground">
                The base address of your Ollama server. SlothSort adds <code>/api/chat</code> and{" "}
                <code>/api/tags</code> itself.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model name</Label>
              <Input
                id="model"
                value={config.model}
                onChange={updateField("model")}
                placeholder="llama3.2"
                autoComplete="off"
                className="h-11 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Access token (optional)</Label>
              <Input
                id="token"
                type="password"
                value={config.token}
                onChange={updateField("token")}
                placeholder="Only for a hosted endpoint that requires a key"
                autoComplete="off"
                className="h-11 rounded-2xl"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Kept in this browser tab's memory for the session only — never written to the app's
                database. A local Ollama server doesn't need one.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" className="rounded-full">
                Save connection
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => refresh(config)}
                disabled={checking}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`} />
                Test connection
              </Button>
              {saved ? <span className="text-xs font-semibold text-primary">Saved</span> : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg tracking-tight">Getting it running</CardTitle>
          <CardDescription>Four steps, in order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">1.</span> Install Ollama on the machine that
            will do the work, then pull a model: <code>ollama pull llama3.2</code>.
          </p>
          <p>
            <span className="font-semibold text-foreground">2.</span> Allow this page to reach it by
            starting the server with <code>OLLAMA_ORIGINS="*" ollama serve</code>.
          </p>
          <p>
            <span className="font-semibold text-foreground">3.</span> Save the address and the exact
            model name above, then press <span className="font-medium text-foreground">Test connection</span>.
          </p>
          <p>
            <span className="font-semibold text-foreground">4.</span> If Ollama runs on a different
            computer, use an address this browser can actually reach — <code>localhost</code> only works
            when it's the same machine.
          </p>
          <p className="rounded-2xl bg-secondary/50 px-3.5 py-3 text-xs">
            SlothSort can't verify this for you. The status above is a live check sent from your browser,
            and it stays "not connected" until a real endpoint answers. Until then, every suggestion is
            labelled as demo data.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg tracking-tight">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Where your data goes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Uploaded files are stored privately inside this app, and only you (and app admins) can open
            them. Nothing is sent to a third-party AI service.
          </p>
          <p>
            When you ask for suggestions, SlothSort sends the file name, type, size and — for plain-text
            files — a short text excerpt to the endpoint you saved here. Images, archives and other
            binaries are never read.
          </p>
          <p>
            SlothSort never moves, renames or deletes your real files. Approving a suggestion only
            records your decision, and an export is a plan you apply yourself.
          </p>
          <p>
            The fictional sample files have no contents at all — they exist so you can try the whole flow
            without touching anything real.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}