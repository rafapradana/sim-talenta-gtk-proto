"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconUpload, IconX, IconLoader2 } from "@tabler/icons-react";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  disabled?: boolean;
}

export function FileUpload({ value, onChange, accept = "image/*,.pdf", disabled }: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload gagal");
        return;
      }

      onChange(data.url);
    } catch {
      setError("Terjadi kesalahan saat upload");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled || loading}
          className="flex-1"
        />
        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={handleClear} disabled={disabled || loading}>
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconLoader2 className="h-4 w-4 animate-spin" />
          Mengupload...
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {value && !loading && (
        <div className="text-sm">
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Lihat file
          </a>
        </div>
      )}
    </div>
  );
}
