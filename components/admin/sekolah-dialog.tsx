"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconLoader2 } from "@tabler/icons-react";

interface Sekolah {
  id: string;
  nama: string;
  npsn: string;
  status: "negeri" | "swasta";
  kota: "kota_malang" | "kota_batu";
  alamat: string;
  kepalaSekolah?: string | null;
}

interface SekolahDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Sekolah | null;
  onSuccess: () => void;
}

export function SekolahDialog({ open, onOpenChange, data, onSuccess }: SekolahDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      nama: formData.get("nama"),
      npsn: formData.get("npsn"),
      status: formData.get("status"),
      kota: formData.get("kota"),
      alamat: formData.get("alamat"),
      kepalaSekolah: formData.get("kepalaSekolah") || null,
    };

    try {
      const res = await fetch(data ? `/api/sekolah/${data.id}` : "/api/sekolah", {
        method: data ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Terjadi kesalahan");
        return;
      }

      onSuccess();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{data ? "Edit Sekolah" : "Tambah Sekolah"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Sekolah</Label>
            <Input id="nama" name="nama" defaultValue={data?.nama} required disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="npsn">NPSN</Label>
            <Input id="npsn" name="npsn" defaultValue={data?.npsn} required disabled={loading} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={data?.status || "negeri"} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="negeri">Negeri</SelectItem>
                  <SelectItem value="swasta">Swasta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kota">Kota</Label>
              <Select name="kota" defaultValue={data?.kota || "kota_malang"} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kota_malang">Kota Malang</SelectItem>
                  <SelectItem value="kota_batu">Kota Batu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea id="alamat" name="alamat" defaultValue={data?.alamat} required disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kepalaSekolah">Kepala Sekolah</Label>
            <Input
              id="kepalaSekolah"
              name="kepalaSekolah"
              defaultValue={data?.kepalaSekolah || ""}
              placeholder="Nama Kepala Sekolah"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <IconLoader2 className="animate-spin mr-2" />}
              {data ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
