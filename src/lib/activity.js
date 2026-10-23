const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };


export async function logActivity(entry) {
  return db.entities.ActivityLog.create(entry);
}

export async function undoActivity(entry) {
  const restoredStatus = entry?.previous?.status || "suggested";
  const ids = entry?.file_ids?.length ? entry.file_ids : entry?.file_id ? [entry.file_id] : [];
  if (ids.length) {
    await db.entities.FileRecord.bulkUpdate(ids.map((id) => ({ id, status: restoredStatus })));
  }
  await db.entities.ActivityLog.update(entry.id, { undone: true });
  return logActivity({
    action: "undo",
    title: `Undid "${entry?.title || "a change"}"`,
    detail: ids.length
      ? `${ids.length} file${ids.length === 1 ? "" : "s"} moved back to ${restoredStatus}.`
      : "Nothing to restore."
  });
}