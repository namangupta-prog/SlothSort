export function buildJson(records) {
  return JSON.stringify(
    {
      app: "SlothSort",
      generated_at: new Date().toISOString(),
      note: "This is a plan only. SlothSort never moves, renames or deletes your real files — apply it yourself if you want to.",
      file_count: records.length,
      plan: records.map((record) => ({
        original_filename: record.filename,
        suggested_filename: record.suggested_filename,
        category: record.category,
        destination_folder: record.destination_folder,
        explanation: record.explanation,
        suggestion_source: record.ai_source === "model" ? record.ai_model : "demo rules",
        approved_by_user: record.status === "approved"
      }))
    },
    null,
    2
  );
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function buildCsv(records) {
  const header = ["original_filename", "suggested_filename", "category", "destination_folder", "explanation"];
  const rows = records.map((record) => [
    record.filename,
    record.suggested_filename,
    record.category,
    record.destination_folder,
    record.explanation
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function download(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}