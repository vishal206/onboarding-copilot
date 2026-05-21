export const PLAN_LABELS: Record<string, { label: string; className: string }> = {
  free:    { label: "Free",    className: "bg-gray-100 text-gray-600" },
  starter: { label: "Starter", className: "bg-blue-100 text-blue-700" },
  growth:  { label: "Growth",  className: "bg-indigo-100 text-indigo-700" },
  scale:   { label: "Scale",   className: "bg-purple-100 text-purple-700" },
};

export const PLAN_MAX_PAGES: Record<string, number | null> = {
  free:    50,
  starter: 500,
  growth:  2500,
  scale:   null,
};
