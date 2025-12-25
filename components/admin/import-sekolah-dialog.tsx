"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconLoader2, IconUpload, IconCheck, IconX, IconAlertCircle, IconPlayerSkipForward } from "@tabler/icons-react";

interface ImportLog {
  step: string;
  status: "processing" | "success" | "error" | "skipped";
  message: string;
  data?: string;
}

interface ImportSekolahDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ImportSekolahDialog({ open, onOpenChange, onSuccess }: ImportSekolahDialogProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [kota, setKota] = useState<string>("");
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [result, setResult] = useState<{
    message: string;
    imported: number;
    skipped: number;
    total: number;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !kota) return;

    setLoading(true);
    setLogs([]);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kota", kota);

    try {
      const res = await fetch("/api/import/sekolah", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.logs) {
        setLogs(data.logs);
      }

      if (!res.ok) {
        setResult({
          message: data.error || "Terjadi kesalahan",
          imported: 0,
          skipped: 0,
          total: 0,
        });
        return;
      }

      setResult({
        message: data.message,
        imported: data.imported,
        skipped: data.skipped,
        total: data.total,
      });

      if (data.imported > 0) {
        onSuccess();
      }
    } catch {
      setResult({
        message: "Terjadi kesalahan koneksi",
        imported: 0,
        skipped: 0,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setFile(null);
    setKota("");
    setLogs([]);
    setResult(null);
    onOpenChange(false);
  }

  function getStatusIcon(status: ImportLog["status"]) {
    switch (status) {
      case "processing":
        return <IconLoader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <IconCheck className="h-4 w-4 text-green-500" />;
      case "error":
        return <IconX className="h-4 w-4 text-red-500" />;
      case "skipped":
        return <IconPlayerSkipForward className="h-4 w-4 text-yellow-500" />;
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Import Data Sekolah</DialogTitle>
          <DialogDescription>
            Upload file Excel (.xlsx) dengan kolom: Nama Satuan Pendidikan, NPSN, Status Sekolah, Alamat, Nama Kepala Sekolah
            <br />
            <span className="text-xs text-muted-foreground">
              Jenjang (SMA/SMK/SLB) akan dideteksi otomatis dari nama sekolah
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kota">Kota</Label>
              <Select value={kota} onValueChange={setKota} disabled={loading} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kota" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kota_malang">Kota Malang</SelectItem>
                  <SelectItem value="kota_batu">Kota Batu</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
            </div>
          </div>

          {logs.length > 0 && (
            <div className="space-y-2">
              <Label>Log Proses Import</Label>
              <ScrollArea className="h-64 border rounded-md p-2">
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 p-2 rounded border text-sm ${getStatusColor(log.status)}`}
                    >
                      <div className="mt-0.5">{getStatusIcon(log.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{log.step}</div>
                        <div className="text-muted-foreground">{log.message}</div>
                        {log.data && (
                          <div className="text-xs text-muted-foreground mt-1">{log.data}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {result && (
            <div
              className={`p-4 rounded-md ${
                result.imported > 0
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {result.imported > 0 ? (
                  <IconCheck className="h-5 w-5" />
                ) : (
                  <IconAlertCircle className="h-5 w-5" />
                )}
                {result.message}
              </div>
              {result.total > 0 && (
                <div className="mt-2 text-sm grid grid-cols-3 gap-2">
                  <div className="bg-white/50 rounded p-2 text-center">
                    <div className="font-bold text-lg">{result.imported}</div>
                    <div className="text-xs">Berhasil</div>
                  </div>
                  <div className="bg-white/50 rounded p-2 text-center">
                    <div className="font-bold text-lg">{result.skipped}</div>
                    <div className="text-xs">Dilewati</div>
                  </div>
                  <div className="bg-white/50 rounded p-2 text-center">
                    <div className="font-bold text-lg">{result.total}</div>
                    <div className="text-xs">Total</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              {result ? "Tutup" : "Batal"}
            </Button>
            {!result && (
              <Button type="submit" disabled={loading || !file || !kota}>
                {loading ? (
                  <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <IconUpload className="h-4 w-4 mr-2" />
                )}
                Import
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
