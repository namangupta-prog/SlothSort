import { useCallback, useEffect, useState } from "react";
import { loadConfig } from "@/lib/ollamaConfig";
import { checkConnection } from "@/lib/ollama";

export default function useConnection() {
  const initial = loadConfig();
  const [config, setConfig] = useState(initial);
  const [status, setStatus] = useState(initial.endpoint && initial.model ? "checking" : "unconfigured");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  const refresh = useCallback(async (nextConfig) => {
    const active = nextConfig || loadConfig();
    setConfig(active);
    if (!active.endpoint || !active.model) {
      setStatus("unconfigured");
      setMessage("No endpoint or model saved yet, so SlothSort is in demo mode.");
      return;
    }
    setChecking(true);
    setStatus("checking");
    const result = await checkConnection(active);
    setStatus(result.status);
    setMessage(result.message);
    setChecking(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { config, status, message, checking, refresh };
}