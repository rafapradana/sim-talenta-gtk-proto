"use client";

import { useEffect, useState } from "react";
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
  alamat: string;
  kepalaSekolahId?: string | null;
}

interface Gtk {
  id: string;
  namaLengkap: string;
  jenis: string;
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
  const [kepalaSekolahList, setKepalaSekolahList] = useState<Gtk[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/api/gtk?all=true&jenis=kepala_sekolah")
        .then((res) => res.json())
        .then((json) => setKepalaSekolahList(json.data || []));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      nama: formData.get("nama"),
      npsn: formData.get("npsn"),
      status: formData.get("status"),
      alamat: formData.get("alamat"),
      kepalaSekolahId: formData.get("kepalaSekolahId") || null,
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
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea id="alamat" name="alamat" defaultValue={data?.alamat} required disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kepalaSekolahId">Kepala Sekolah</Label>
            <Select name="kepalaSekolahId" defaultValue={data?.kepalaSekolahId || ""} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kepala Sekolah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {kepalaSekolahList.map((ks) => (
                  <SelectItem key={ks.id} value={ks.id}>
                    {ks.namaLengkap}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
