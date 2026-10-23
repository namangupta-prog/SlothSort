const CONFIG_KEY = "slothsort.ollama.config";
const TOKEN_KEY = "slothsort.ollama.token";

export const DEFAULT_CONFIG = { endpoint: "", model: "", token: "" };

export function loadConfig() {
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}");
  } catch {
    stored = {};
  }
  let token = "";
  try {
    token = sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    token = "";
  }
  return {
    endpoint: stored.endpoint || "",
    model: stored.model || "",
    token
  };
}

export function saveConfig({ endpoint = "", model = "", token = "" }) {
  localStorage.setItem(
    CONFIG_KEY,
    JSON.stringify({ endpoint: endpoint.trim(), model: model.trim() })
  );
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function baseUrl(endpoint) {
  return String(endpoint || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/(chat|tags|generate|embeddings|pull)$/i, "");
}