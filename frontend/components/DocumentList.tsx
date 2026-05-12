"use client";

import { useEffect, useState } from "react";
import { IconFileText } from "@tabler/icons-react";

interface Document {
  id: string;
  filename: string;
  status: string;
}

interface DocumentListProps {
  botId: string;
  refreshTrigger: number;
  onDocCountChange?: (count: number) => void;
}

const STATUS_LABELS: Record<string, string> = {
  uploaded:        "Uploading…",
  parsed:          "Parsing…",
  indexed:         "Indexed",
  failed:          "Failed",
  "indexing failed": "Failed",
};

/* Tailwind classes for each status pill */
const STATUS_STYLES: Record<string, string> = {
  uploaded:          "bg-info-bg text-info-tx",
  parsed:            "bg-warning-bg text-warning-tx",
  indexed:           "bg-success-bg text-success-tx",
  failed:            "bg-danger-bg text-danger-tx",
  "indexing failed": "bg-danger-bg text-danger-tx",
};

/* Dot color for the status indicator */
const STATUS_DOT: Record<string, string> = {
  uploaded:          "bg-info-tx",
  parsed:            "bg-warning-tx",
  indexed:           "bg-success-tx",
  failed:            "bg-danger-tx",
  "indexing failed": "bg-danger-tx",
};

export default function DocumentList({
  botId,
  refreshTrigger,
  onDocCountChange,
}: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/${botId}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setDocuments(data);
      onDocCountChange?.(data.length);
    };
    load();
  }, [botId, refreshTrigger]);

  useEffect(() => {
    const processing = documents.filter(
      (d) =>
        d.status !== "indexed" &&
        d.status !== "failed" &&
        d.status !== "indexing failed",
    );
    if (processing.length === 0) return;

    const interval = setInterval(async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/${botId}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setDocuments(data);
      const stillProcessing = data.filter(
        (d: Document) =>
          d.status !== "indexed" &&
          d.status !== "failed" &&
          d.status !== "indexing failed",
      );
      if (stillProcessing.length === 0) clearInterval(interval);
    }, 2000);

    return () => clearInterval(interval);
  }, [documents]);

  if (documents.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-line-3 overflow-hidden">
      {documents.map((doc, i) => (
        <div
          key={doc.id}
          className={`flex items-center justify-between px-4 py-3 ${
            i < documents.length - 1 ? "border-b border-line-3" : ""
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <IconFileText size={14} className="text-ink-3 shrink-0" strokeWidth={1.75} />
            <span className="text-[13px] text-ink truncate">{doc.filename}</span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ml-3 ${
              STATUS_STYLES[doc.status] ?? "bg-muted text-ink-3"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                STATUS_DOT[doc.status] ?? "bg-ink-3"
              }`}
            />
            {STATUS_LABELS[doc.status] ?? doc.status}
          </span>
        </div>
      ))}
    </div>
  );
}
