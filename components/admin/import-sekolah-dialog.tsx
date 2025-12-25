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
import { IconLoader2, IconUpload } from "@tabler/icons-react";

interface ImportSekolahDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ImportSekolahDialog({ open, onOpenChange, onSuccess }: ImportSekolahDialogProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [kota, setKota] = useState<string>("");
  const [result, setResult] = useState<{
    message: string;
    imported: number;
    skipped: number;
    total: number;
    errors?: string[];
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !kota) return;

    setLoading(true);
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

      if (!res.ok) {
        setResult({ message: data.error, imported: 0, skipped: 0, total: 0 });
        return;
      }

      setResult(data);
      if (data.imported > 0) {
        onSuccess();
      }
    } catch {
      setResult({ message: "Terjadi kesalahan", imported: 0, skipped: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setFile(null);
    setKota("");
    setResult(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data Sekolah</DialogTitle>
          <DialogDescription>
            Upload file Excel (.xlsx) dengan kolom: Nama Satuan Pendidikan, NPSN, Status Sekolah, Alamat, Nama Kepala Sekolah
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kota">Kota</Label>
            <Select value={kota} onValueChange={setKota} required>
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
              required
            />
          </div>

          {result && (
            <div className={`p-3 rounded-md text-sm ${result.imported > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              <p className="font-medium">{result.message}</p>
              {result.total > 0 && (
                <p className="mt-1">
                  Berhasil: {result.imported} | Dilewati: {result.skipped} | Total: {result.total}
                </p>
              )}
              {result.errors && result.errors.length > 0 && (
                <ul className="mt-2 text-xs">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Tutup
            </Button>
            <Button type="submit" disabled={loading || !file || !kota}>
              {loading ? (
                <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <IconUpload className="h-4 w-4 mr-2" />
              )}
              Import
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
