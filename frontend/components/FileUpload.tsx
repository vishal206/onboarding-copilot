"use client";

import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";

const ALLOWED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface FileUploadProps {
  botId: string;
  onUploadSuccess: () => void;
}

export default function FileUpload({
  botId,
  onUploadSuccess,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const reason = rejectedFiles[0].errors[0].code;
        if (reason === "file-too-large")
          setError("File is too large. Max size is 10MB.");
        else if (reason === "file-invalid-type")
          setError("Only PDF, DOCX, and TXT files are allowed.");
        else setError("File rejected. Please try again.");
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bot_id", botId);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/documents/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Upload failed");
        }

        onUploadSuccess();
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
        setError(message);
      } finally {
        setUploading(false);
      }
    },
    [botId, onUploadSuccess],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">📄</span>
          {uploading ? (
            <p className="text-gray-500 font-medium">Uploading...</p>
          ) : isDragActive ? (
            <p className="text-blue-500 font-medium">Drop the file here</p>
          ) : (
            <>
              <p className="text-gray-600 font-medium">
                Drag & drop a file here, or click to browse
              </p>
              <p className="text-gray-400 text-sm">PDF, DOCX, TXT · Max 10MB</p>
            </>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
    </div>
  );
}
