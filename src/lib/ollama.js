import { baseUrl } from "./ollamaConfig";
import { CATEGORIES } from "./categories";

const CHUNK_SIZE = 6;

export function isConfigured(config) {
  return Boolean(config && config.endpoint && config.model);
}

async function request(url, token, init = {}) {
  const headers = { ...(init.headers || {}) };
  if (init.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { ...init, headers });
}

export function describeError(err, endpoint) {
  const target = baseUrl(endpoint) || endpoint || "the endpoint";
  const text = String(err?.message || err);
  if (/Failed to fetch|NetworkError|Load failed|Network request failed/i.test(text)) {
    return `Couldn't reach ${target}. Check the address is right and reachable from this browser, and that the server allows requests from this page (for Ollama, start it with OLLAMA_ORIGINS="*").`;
  }
  return `The endpoint at ${target} didn't answer as expected: ${text}`;
}

export async function checkConnection(config) {
  if (!config?.endpoint) {
    return { status: "unconfigured", message: "No endpoint saved yet, so SlothSort is in demo mode." };
  }
  const root = baseUrl(config.endpoint);
  try {
    const response = await request(`${root}/api/tags`, config.token, { method: "GET" });
    if (!response.ok) {
      return { status: "error", message: `Reached ${root}, but it answered ${response.status} ${response.statusText}.` };
    }
    const data = await response.json();
    const models = (data?.models || []).map((m) => m.name || m.model).filter(Boolean);
    if (!models.length) {
      return { status: "connected", message: `Reached ${root}. It didn't list any models — make sure you have pulled one.` };
    }
    const wanted = config.model;
    const hasModel = wanted
      ? models.some((name) => name === wanted || name.split(":")[0] === wanted.split(":")[0])
      : false;
    if (wanted && !hasModel) {
      return {
        status: "error",
        message: `Reached ${root}, but "${wanted}" isn't installed there. Available: ${models.slice(0, 6).join(", ")}.`,
        models
      };
    }
    return {
      status: "connected",
      message: `Connected to ${root} — ${models.length} model${models.length === 1 ? "" : "s"} available.`,
      models
    };
  } catch (err) {
    return { status: "error", message: describeError(err, config.endpoint) };
  }
}

function buildPrompt(files) {
  const lines = files.map((file, index) => {
    const parts = [
      `${index + 1}. id=${file.id}`,
      `name=${file.filename}`,
      `type=${file.file_type || "unknown"}`,
      `size=${file.file_size || 0} bytes`
    ];
    if (file.excerpt) {
      parts.push(`excerpt="${String(file.excerpt).replace(/\s+/g, " ").slice(0, 800)}"`);
    }
    return parts.join(" | ");
  });
  return [
    "You are a careful file-organizing assistant. For each file below, propose a tidier filename, one category, a destination folder and a one-sentence reason.",
    `Allowed categories (choose exactly one, spelled exactly): ${CATEGORIES.join(", ")}.`,
    'Use a short forward-slash folder path of at most two levels, for example "Finance/Invoices".',
    "Reply with JSON only, no commentary, in exactly this shape:",
    '{"files":[{"id":"<the id given>","suggested_filename":"...","category":"...","destination_folder":"...","explanation":"...","confidence":0.0}]}',
    "",
    "Files:"
  ]
    .concat(lines)
    .join("\n");
}

function parseModelJson(text) {
  const raw = String(text || "")
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("the reply wasn't JSON");
  return JSON.parse(raw.slice(start, end + 1));
}

function listFrom(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.files)) return parsed.files;
  if (Array.isArray(parsed?.results)) return parsed.results;
  return [];
}

function cleanSuggestion(item, fallback) {
  const category = CATEGORIES.includes(item?.category) ? item.category : "Other";
  const confidence = Number(item?.confidence);
  return {
    id: item?.id || fallback.id,
    suggested_filename: String(item?.suggested_filename || fallback.filename).slice(0, 160),
    category,
    destination_folder: String(item?.destination_folder || category).slice(0, 120),
    explanation: String(item?.explanation || "The model didn't explain this one.").slice(0, 400),
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : null
  };
}

export async function analyzeFiles(files, config) {
  const url = `${baseUrl(config.endpoint)}/api/chat`;
  const results = [];
  for (let index = 0; index < files.length; index += CHUNK_SIZE) {
    const chunk = files.slice(index, index + CHUNK_SIZE);
    const response = await request(url, config.token, {
      method: "POST",
      body: JSON.stringify({
        model: config.model,
        stream: false,
        format: "json",
        messages: [{ role: "user", content: buildPrompt(chunk) }]
      })
    });
    if (!response.ok) {
      throw new Error(`The model endpoint answered ${response.status} ${response.statusText}.`);
    }
    const data = await response.json();
    const payload = data?.message?.content ?? data?.response ?? "";
    const items = listFrom(parseModelJson(payload));
    chunk.forEach((file, offset) => {
      const match = items.find((item) => item && String(item.id) === String(file.id)) || items[offset];
      results.push(cleanSuggestion(match, file));
    });
  }
  return results;
}