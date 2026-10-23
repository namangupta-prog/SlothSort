export const CATEGORIES = [
  "Documents",
  "Images",
  "Work",
  "School",
  "Finance",
  "Downloads",
  "Other"
];

export const CATEGORY_STYLES = {
  Documents: "border-stone-200 bg-stone-100 text-stone-700",
  Images: "border-rose-200 bg-rose-50 text-rose-700",
  Work: "border-emerald-200 bg-emerald-50 text-emerald-700",
  School: "border-amber-200 bg-amber-50 text-amber-700",
  Finance: "border-teal-200 bg-teal-50 text-teal-700",
  Downloads: "border-orange-200 bg-orange-50 text-orange-700",
  Other: "border-slate-200 bg-slate-100 text-slate-600"
};

export const STATUS_META = {
  new: { label: "Needs suggestion", style: "border-stone-200 bg-stone-100 text-stone-600" },
  suggested: { label: "Awaiting review", style: "border-amber-200 bg-amber-50 text-amber-700" },
  approved: { label: "Approved", style: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected", style: "border-rose-200 bg-rose-50 text-rose-700" }
};