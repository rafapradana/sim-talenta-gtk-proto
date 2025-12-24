"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconLoader2 } from "@tabler/icons-react";

interface Gtk {
  id: string;
  namaLengkap: string;
  nuptk: string | null;
  nip: string | null;
  kelamin: "L" | "P";
  tanggalLahir?: string;
  jenis: "guru" | "tendik" | "kepala_sekolah";
  jabatan: string | null;
  sekolahId?: string | null;
  sekolah?: { id: string; nama: string } | null;
  user?: { email: string };
}

interface Sekolah {
  id: string;
  nama: string;
}

interface GtkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Gtk | null;
  onSuccess: () => void;
}

export function GtkDialog({ open, onOpenChange, data, onSuccess }: GtkDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sekolahList, setSekolahList] = useState<Sekolah[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/api/sekolah?all=true")
        .then((res) => res.json())
        .then((json) => setSekolahList(json.data || []));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      namaLengkap: formData.get("namaLengkap"),
      nuptk: formData.get("nuptk") || null,
      nip: formData.get("nip") || null,
      kelamin: formData.get("kelamin"),
      tanggalLahir: formData.get("tanggalLahir"),
      jenis: formData.get("jenis"),
      jabatan: formData.get("jabatan") || null,
      sekolahId: formData.get("sekolahId") || null,
    };

    if (!data) {
      body.email = formData.get("email");
      body.password = formData.get("password");
    }

    try {
      const res = await fetch(data ? `/api/gtk/${data.id}` : "/api/gtk", {
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{data ? "Edit GTK" : "Tambah GTK"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
          )}

          {!data && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required disabled={loading} />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="namaLengkap">Nama Lengkap</Label>
            <Input id="namaLengkap" name="namaLengkap" defaultValue={data?.namaLengkap} required disabled={loading} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nuptk">NUPTK</Label>
              <Input id="nuptk" name="nuptk" defaultValue={data?.nuptk || ""} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nip">NIP</Label>
              <Input id="nip" name="nip" defaultValue={data?.nip || ""} disabled={loading} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kelamin">Jenis Kelamin</Label>
              <Select name="kelamin" defaultValue={data?.kelamin || "L"} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
              <Input
                id="tanggalLahir"
                name="tanggalLahir"
                type="date"
                defaultValue={data?.tanggalLahir?.split("T")[0]}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jenis">Jenis GTK</Label>
              <Select name="jenis" defaultValue={data?.jenis || "guru"} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guru">Guru</SelectItem>
                  <SelectItem value="tendik">Tendik</SelectItem>
                  <SelectItem value="kepala_sekolah">Kepala Sekolah</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jabatan">Jabatan</Label>
              <Input id="jabatan" name="jabatan" defaultValue={data?.jabatan || ""} disabled={loading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sekolahId">Sekolah</Label>
            <Select name="sekolahId" defaultValue={data?.sekolah?.id || data?.sekolahId || ""} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Sekolah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {sekolahList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nama}
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
