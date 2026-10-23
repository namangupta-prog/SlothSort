export function extensionOf(filename) {
  const parts = String(filename || "").split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

export function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = value / 1024;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  const rounded = size >= 10 || index === 0 ? Math.round(size) : size.toFixed(1);
  return `${rounded} ${units[index]}`;
}

const TEXT_EXTENSIONS = ["txt", "md", "csv", "json", "log", "yml", "yaml", "html", "htm", "xml", "js", "ts", "jsx", "tsx", "css", "py", "sql"];

export function isTextLike(name, type) {
  const mime = String(type || "").toLowerCase();
  if (mime.startsWith("text/")) return true;
  if (["application/json", "application/xml", "application/javascript"].includes(mime)) return true;
  return TEXT_EXTENSIONS.includes(extensionOf(name));
}

export async function readExcerpt(file, max = 1200) {
  if (!isTextLike(file.name, file.type)) return "";
  try {
    const text = await file.slice(0, 8000).text();
    return text.replace(/\u0000/g, " ").slice(0, max);
  } catch {
    return "";
  }
}

export function escapeRegex(term) {
  return String(term || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildSearchName(...parts) {
  return parts.filter(Boolean).join(" ").toLowerCase();
}