"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IconLoader2, IconUpload, IconCheck, IconX, IconAlertCircle, IconPlayerSkipForward } from "@tabler/icons-react";

interface ImportLog {
  step: string;
  status: "processing" | "success" | "error" | "skipped";
  message: string;
  data?: string;
}

interface ImportGtkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ImportGtkDialog({ open, onOpenChange, onSuccess }: ImportGtkDialogProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [result, setResult] = useState<{
    sekolah?: string;
    imported: number;
    skipped: number;
    total: number;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setLogs([]);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import/gtk", {
        method: "POST",
        body: formData,
      });

      if (!res.ok && !res.body) {
        const data = await res.json();
        setLogs([{ step: "Error", status: "error", message: data.error || "Terjadi kesalahan" }]);
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setLogs([{ step: "Error", status: "error", message: "Tidak dapat membaca response" }]);
        setLoading(false);
        return;
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const log = JSON.parse(line);
            if (log.step === "DONE") {
              const resultData = JSON.parse(log.message);
              setResult(resultData);
              if (resultData.imported > 0) {
                onSuccess();
              }
            } else {
              setLogs((prev) => [...prev, log]);
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      setLogs((prev) => [...prev, { step: "Error", status: "error", message: "Terjadi kesalahan koneksi" }]);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setFile(null);
    setLogs([]);
    setResult(null);
    onOpenChange(false);
  }

  function getStatusIcon(status: ImportLog["status"]) {
    switch (status) {
      case "processing":
        return <IconLoader2 className="h-3 w-3 animate-spin text-blue-500 flex-shrink-0" />;
      case "success":
        return <IconCheck className="h-3 w-3 text-green-500 flex-shrink-0" />;
      case "error":
        return <IconX className="h-3 w-3 text-red-500 flex-shrink-0" />;
      case "skipped":
        return <IconPlayerSkipForward className="h-3 w-3 text-yellow-500 flex-shrink-0" />;
      default:
        return null;
    }
  }

  function getStatusColor(status: ImportLog["status"]) {
    switch (status) {
      case "processing":
        return "bg-blue-50 border-blue-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "skipped":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Data GTK</DialogTitle>
          <DialogDescription>
            Upload file Excel (.xlsx) dengan nama file sesuai nama sekolah.
            <br />
            Contoh: <code className="bg-muted px-1 rounded">SMKN 4 Malang.xlsx</code>
            <br />
            <span className="text-xs text-muted-foreground mt-1 block">
              Kolom: Nama Lengkap, NUPTK, NIP, L/P, Tanggal Lahir, Jenis PTK, Jabatan PTK
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">File Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
              required
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Nama sekolah dari file: <strong>{file.name.replace(/\.(xlsx|xls)$/i, "")}</strong>
              </p>
            )}
          </div>

          {logs.length > 0 && (
            <div className="space-y-2">
              <Label>Log Proses Import ({logs.length} entries)</Label>
              <div 
                ref={scrollRef}
                className="h-48 overflow-y-auto border rounded-md p-2 space-y-1 bg-muted/30"
              >
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-1.5 rounded border text-xs ${getStatusColor(log.status)}`}
                  >
                    <div className="mt-0.5">{getStatusIcon(log.status)}</div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <span className="font-medium">{log.step}:</span>{" "}
                      <span className="text-muted-foreground break-words">{log.message}</span>
                      {log.data && (
                        <span className="text-muted-foreground/70 block truncate">{log.data}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div
              className={`p-3 rounded-md text-sm ${
                result.imported > 0
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {result.imported > 0 ? (
                  <IconCheck className="h-4 w-4" />
                ) : (
                  <IconAlertCircle className="h-4 w-4" />
                )}
                Import Selesai
              </div>
              {result.sekolah && (
                <p className="mt-1 text-xs">Sekolah: {result.sekolah}</p>
              )}
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/50 rounded p-2">
                  <div className="font-bold">{result.imported}</div>
                  <div className="text-xs">Berhasil</div>
                </div>
                <div className="bg-white/50 rounded p-2">
                  <div className="font-bold">{result.skipped}</div>
                  <div className="text-xs">Dilewati</div>
                </div>
                <div className="bg-white/50 rounded p-2">
                  <div className="font-bold">{result.total}</div>
                  <div className="text-xs">Total</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              {result ? "Tutup" : "Batal"}
            </Button>
            {!result && (
              <Button type="submit" disabled={loading || !file}>
                {loading ? (
                  <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <IconUpload className="h-4 w-4 mr-2" />
                )}
                {loading ? "Mengimport..." : "Import"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
