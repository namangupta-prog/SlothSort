import { extensionOf } from "./fileUtils";

const RULES = [
  { keywords: ["invoice", "receipt", "tax", "budget", "payroll", "expense", "bank", "statement", "quote"], category: "Finance", folder: "Finance/Invoices" },
  { keywords: ["lecture", "assignment", "essay", "syllabus", "course", "exam", "notes", "homework", "thesis"], category: "School", folder: "School/Coursework" },
  { keywords: ["contract", "proposal", "client", "report", "meeting", "roadmap", "spec", "kpi", "onboarding"], category: "Work", folder: "Work/Projects" },
  { keywords: ["screenshot", "screen shot", "photo", "selfie", "img_", "wallpaper", "avatar"], category: "Images", folder: "Images" },
  { keywords: ["installer", "setup", "torrent", "download"], category: "Downloads", folder: "Downloads/Software" },
  { keywords: ["resume", "cv", "passport", "certificate", "manual", "guide", "form"], category: "Documents", folder: "Documents/Personal" }
];

const EXTENSION_MAP = {
  pdf: "Documents", doc: "Documents", docx: "Documents", txt: "Documents", md: "Documents", rtf: "Documents", odt: "Documents",
  jpg: "Images", jpeg: "Images", png: "Images", gif: "Images", webp: "Images", heic: "Images", svg: "Images",
  xls: "Finance", xlsx: "Finance", csv: "Finance", numbers: "Finance",
  zip: "Downloads", rar: "Downloads", "7z": "Downloads", dmg: "Downloads", pkg: "Downloads", exe: "Downloads",
  ppt: "Work", pptx: "Work", key: "Work"
};

const FOLDER_BY_CATEGORY = {
  Documents: "Documents",
  Images: "Images",
  Work: "Work",
  School: "School",
  Finance: "Finance",
  Downloads: "Downloads",
  Other: "Other/Unsorted"
};

const ARTICLES = { Images: "an image", Downloads: "a download", Documents: "a document", Finance: "a finance document", Work: "a work document", School: "coursework", Other: "a file to sort" };

function tidyFilename(filename) {
  const extension = extensionOf(filename);
  const base = String(filename || "")
    .replace(/\.[^.]+$/, "")
    .replace(/\(\d+\)/g, "")
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = base
    ? base.split(" ").filter(Boolean).slice(0, 6).map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    : ["Untitled"];
  return `${words.join(" ")}${extension ? `.${extension}` : ""}`;
}

export function demoSuggest(file) {
  const original = String(file?.filename || "untitled");
  const extension = extensionOf(original);
  const haystack = `${original} ${file?.file_type || ""}`.toLowerCase();
  const rule = RULES.find((entry) => entry.keywords.some((keyword) => haystack.includes(keyword)));
  const category =
    rule?.category ||
    EXTENSION_MAP[extension] ||
    (String(file?.file_type || "").toLowerCase().startsWith("image/") ? "Images" : "Other");
  let folder = rule?.folder || FOLDER_BY_CATEGORY[category] || "Other/Unsorted";
  if (category === "Images") folder = haystack.includes("screenshot") ? "Images/Screenshots" : "Images";
  const matched = rule?.keywords.find((keyword) => haystack.includes(keyword));
  const reason = matched
    ? `the name mentions "${matched}", which usually means ${ARTICLES[category] || "this kind of file"}`
    : extension
      ? `.${extension} files are usually kept in ${category}`
      : `nothing in the name gave it away, so it stays in ${category}`;
  return {
    id: file.id,
    suggested_filename: tidyFilename(original),
    category,
    destination_folder: folder,
    explanation: `Demo rule — ${reason}. No model is connected, so this is a guess from SlothSort's own rules.`,
    confidence: 0.4
  };
}