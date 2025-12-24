"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconLoader2 } from "@tabler/icons-react";

interface TalentaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gtkId: string;
  onSuccess: () => void;
}

export function TalentaDialog({ open, onOpenChange, gtkId, onSuccess }: TalentaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jenis, setJenis] = useState("peserta_pelatihan");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      gtkId,
      jenis,
    };

    if (jenis === "peserta_pelatihan") {
      body.namaKegiatan = formData.get("namaKegiatan");
      body.penyelenggaraKegiatan = formData.get("penyelenggaraKegiatan");
      body.tanggalMulai = formData.get("tanggalMulai");
      body.jangkaWaktu = parseInt(formData.get("jangkaWaktu") as string) || null;
    } else if (jenis === "pembimbing_lomba" || jenis === "peserta_lomba") {
      body.namaLomba = formData.get("namaLomba");
      body.jenjang = formData.get("jenjang");
      body.penyelenggaraKegiatan = formData.get("penyelenggaraKegiatan");
      body.bidang = formData.get("bidang");
      body.prestasi = formData.get("prestasi");
      body.buktiUrl = formData.get("buktiUrl") || null;
    } else if (jenis === "minat_bakat") {
      body.deskripsi = formData.get("deskripsi");
    }

    try {
      const res = await fetch("/api/talenta", {
        method: "POST",
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
          <DialogTitle>Tambah Talenta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
          )}

          <div className="space-y-2">
            <Label>Jenis Talenta</Label>
            <Select value={jenis} onValueChange={setJenis} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="peserta_pelatihan">Peserta Pelatihan</SelectItem>
                <SelectItem value="pembimbing_lomba">Pembimbing Lomba</SelectItem>
                <SelectItem value="peserta_lomba">Peserta Lomba</SelectItem>
                <SelectItem value="minat_bakat">Minat/Bakat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {jenis === "peserta_pelatihan" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="namaKegiatan">Nama Kegiatan</Label>
                <Input id="namaKegiatan" name="namaKegiatan" required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="penyelenggaraKegiatan">Penyelenggara Kegiatan</Label>
                <Input id="penyelenggaraKegiatan" name="penyelenggaraKegiatan" required disabled={loading} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
                  <Input id="tanggalMulai" name="tanggalMulai" type="date" required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jangkaWaktu">Jangka Waktu (Hari)</Label>
                  <Input id="jangkaWaktu" name="jangkaWaktu" type="number" min="1" required disabled={loading} />
                </div>
              </div>
            </>
          )}

          {(jenis === "pembimbing_lomba" || jenis === "peserta_lomba") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="namaLomba">Nama Lomba</Label>
                <Input id="namaLomba" name="namaLomba" required disabled={loading} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jenjang">Jenjang</Label>
                  <Select name="jenjang" defaultValue="kota" disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kota">Kota</SelectItem>
                      <SelectItem value="provinsi">Provinsi</SelectItem>
                      <SelectItem value="nasional">Nasional</SelectItem>
                      <SelectItem value="internasional">Internasional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bidang">Bidang</Label>
                  <Select name="bidang" defaultValue="akademik" disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="akademik">Akademik</SelectItem>
                      <SelectItem value="inovasi">Inovasi</SelectItem>
                      <SelectItem value="teknologi">Teknologi</SelectItem>
                      <SelectItem value="sosial">Sosial</SelectItem>
                      <SelectItem value="seni">Seni</SelectItem>
                      <SelectItem value="kepemimpinan">Kepemimpinan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="penyelenggaraKegiatan">Penyelenggara</Label>
                <Input id="penyelenggaraKegiatan" name="penyelenggaraKegiatan" required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prestasi">Prestasi</Label>
                <Input id="prestasi" name="prestasi" placeholder="Juara 1, Juara 2, dll" disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buktiUrl">URL Bukti/Sertifikat</Label>
                <Input id="buktiUrl" name="buktiUrl" type="url" placeholder="https://..." disabled={loading} />
              </div>
            </>
          )}

          {jenis === "minat_bakat" && (
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi Minat/Bakat</Label>
              <Textarea id="deskripsi" name="deskripsi" required disabled={loading} rows={4} />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <IconLoader2 className="animate-spin mr-2" />}
              Tambah
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
