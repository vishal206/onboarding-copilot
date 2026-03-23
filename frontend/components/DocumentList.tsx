"use client";

import { useEffect, useState } from "react";

interface Document {
  id: string;
  filename: string;
  status: string;
}

interface DocumentListProps {
  botId: string;
  refreshTrigger: number; // increment this to force a refresh
}

const STATUS_LABELS: Record<string, string> = {
  uploaded: "Uploading...",
  parsed: "Parsing...",
  indexed: "Ready",
  failed: "Failed",
  "indexing failed": "Failed",
};

const STATUS_STYLES: Record<string, string> = {
  uploaded: "bg-blue-50 text-blue-600",
  parsed: "bg-yellow-50 text-yellow-600",
  indexed: "bg-green-50 text-green-600",
  failed: "bg-red-50 text-red-600",
  "indexing failed": "bg-red-50 text-red-600",
};

const STATUS_ICONS: Record<string, string> = {
  uploaded: "⏳",
  parsed: "⚙️",
  indexed: "✅",
  failed: "❌",
  "indexing failed": "❌",
};

export default function DocumentList({
  botId,
  refreshTrigger,
}: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);

  // Fetch on mount and whenever a new upload happens
  useEffect(() => {
    const load = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/${botId}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setDocuments(data);
    };

    load();
  }, [botId, refreshTrigger]);

  // Poll status for documents that are still processing
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

      // Stop polling if all are done
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
    <div className="mt-6 space-y-2">
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Uploaded Documents
      </h4>
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📄</span>
              <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                {doc.filename}
              </span>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${STATUS_STYLES[doc.status] ?? "bg-gray-50 text-gray-500"}`}
            >
              {STATUS_ICONS[doc.status]}{" "}
              {STATUS_LABELS[doc.status] ?? doc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
