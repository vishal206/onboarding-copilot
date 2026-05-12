"use client";

import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { useAuth } from "@clerk/nextjs";
import posthog from "posthog-js";
import { IconUpload, IconLock } from "@tabler/icons-react";
import Link from "next/link";

const ALLOWED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

interface FileUploadProps {
  botId: string;
  onUploadSuccess: () => void;
  atLimit?: boolean;
  maxDocs?: number | null;
}

export default function FileUpload({
  botId,
  onUploadSuccess,
  atLimit = false,
  maxDocs,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitError, setLimitError] = useState(false);
  const { getToken } = useAuth();

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);
      setLimitError(false);

      if (rejectedFiles.length > 0) {
        const reason = rejectedFiles[0].errors[0].code;
        if (reason === "file-too-large")
          setError("File is too large. Max size is 10 MB.");
        else if (reason === "file-invalid-type")
          setError("Only PDF, DOCX, and TXT files are allowed.");
        else setError("File rejected. Please try again.");
        posthog.capture("document_upload_failed", {
          bot_id: botId,
          failure_reason: reason,
          file_name: rejectedFiles[0].file.name,
          file_type: rejectedFiles[0].file.type,
          file_size: rejectedFiles[0].file.size,
        });
        return;
      }

      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bot_id", botId);

        const token = await getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/documents/upload`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          },
        );

        if (!res.ok) {
          if (res.status === 403) { setLimitError(true); return; }
          const data = await res.json();
          const message =
            typeof data.detail === "string"
              ? data.detail
              : (data.detail?.[0]?.msg ?? "Upload failed");
          throw new Error(message);
        }

        const data = await res.json();
        posthog.capture("doc_uploaded", {
          bot_id: botId,
          document_id: data.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
        });
        onUploadSuccess();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        posthog.capture("document_upload_failed", {
          bot_id: botId,
          failure_reason: "server_error",
          error_message: message,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
        });
        posthog.captureException(err);
        setError(message);
      } finally {
        setUploading(false);
      }
    },
    [botId, getToken, onUploadSuccess],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: uploading || atLimit,
  });

  if (atLimit) {
    return (
      <div className="border border-dashed border-line-2 rounded-xl p-10 text-center bg-muted">
        <div className="flex flex-col items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-subtle flex items-center justify-center">
            <IconLock size={16} className="text-ink-3" strokeWidth={1.75} />
          </div>
          <p className="text-[13px] font-medium text-ink">Document limit reached</p>
          <p className="text-[13px] text-ink-2">
            {maxDocs != null
              ? `Your plan allows up to ${maxDocs} document${maxDocs === 1 ? "" : "s"}.`
              : "You've reached your plan's document limit."}{" "}
            <Link href="/pricing" className="text-ember-dark font-medium hover:underline">
              Upgrade your plan
            </Link>{" "}
            to upload more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-ember bg-ember-light"
            : "border-line-2 hover:border-ember/50 hover:bg-muted"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDragActive ? "bg-ember text-white" : "bg-muted text-ink-3"}`}>
            <IconUpload size={16} strokeWidth={1.75} />
          </div>
          {uploading ? (
            <p className="text-[13px] text-ink-2">Uploading your document…</p>
          ) : isDragActive ? (
            <p className="text-[13px] font-medium text-ember-dark">Drop the file here</p>
          ) : (
            <>
              <p className="text-[13px] font-medium text-ink">
                Drag &amp; drop a file, or click to browse
              </p>
              <p className="text-[12px] text-ink-3">PDF, DOCX, TXT · max 10 MB</p>
            </>
          )}
        </div>
      </div>

      {limitError && (
        <p className="mt-2 text-[13px] text-warning-tx">
          You&apos;ve hit your document limit.{" "}
          <Link href="/pricing" className="font-medium underline hover:opacity-80">
            Upgrade your plan →
          </Link>
        </p>
      )}
      {error && <p className="mt-2 text-[13px] text-danger-tx">{error}</p>}
    </div>
  );
}
