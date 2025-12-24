"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TalentaDialog } from "@/components/admin/talenta-dialog";
import { IconPlus, IconArrowLeft, IconCheck, IconX, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Talenta {
  id: string;
  jenis: string;
  namaKegiatan?: string | null;
  penyelenggaraKegiatan?: string | null;
  tanggalMulai?: string | null;
  jangkaWaktu?: number | null;
  namaLomba?: string | null;
  jenjang?: string | null;
  bidang?: string | null;
  prestasi?: string | null;
  buktiUrl?: string | null;
  deskripsi?: string | null;
  isVerified: boolean;
}

interface GtkDetail {
  id: string;
  namaLengkap: string;
  nuptk: string | null;
  nip: string | null;
  kelamin: "L" | "P";
  tanggalLahir: string;
  jenis: string;
  jabatan: string | null;
  sekolah?: { nama: string } | null;
  user?: { email: string };
  talentaList: Talenta[];
}

const jenisLabels: Record<string, string> = {
  guru: "Guru",
  tendik: "Tendik",
  kepala_sekolah: "Kepala Sekolah",
  peserta_pelatihan: "Peserta Pelatihan",
  pembimbing_lomba: "Pembimbing Lomba",
  peserta_lomba: "Peserta Lomba",
  minat_bakat: "Minat/Bakat",
};

const jenjangLabels: Record<string, string> = {
  kota: "Kota",
  provinsi: "Provinsi",
  nasional: "Nasional",
  internasional: "Internasional",
};

const bidangLabels: Record<string, string> = {
  akademik: "Akademik",
  inovasi: "Inovasi",
  teknologi: "Teknologi",
  sosial: "Sosial",
  seni: "Seni",
  kepemimpinan: "Kepemimpinan",
};

export default function GtkDetailPage() {
  const params = useParams();
  const [data, setData] = useState<GtkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    const res = await fetch(`/api/gtk/${params.id}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function handleVerify(talentaId: string, verify: boolean) {
    await fetch(`/api/talenta/${talentaId}/verify`, {
      method: verify ? "POST" : "DELETE",
    });
    fetchData();
  }

  async function handleDeleteTalenta() {
    if (!deleteId) return;
    await fetch(`/api/talenta/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchData();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse bg-muted rounded" />
        <div className="h-64 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  if (!data) return <div>GTK tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/gtk">
          <Button variant="ghost" size="icon">
            <IconArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Detail GTK</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi GTK</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nama Lengkap</p>
                <p className="font-medium">{data.namaLengkap}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{data.user?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">NUPTK</p>
                <p className="font-medium">{data.nuptk || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">NIP</p>
                <p className="font-medium">{data.nip || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Jenis Kelamin</p>
                <p className="font-medium">{data.kelamin === "L" ? "Laki-laki" : "Perempuan"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tanggal Lahir</p>
                <p className="font-medium">{new Date(data.tanggalLahir).toLocaleDateString("id-ID")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Jenis GTK</p>
                <Badge variant="outline">{jenisLabels[data.jenis]}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Jabatan</p>
                <p className="font-medium">{data.jabatan || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Sekolah</p>
                <p className="font-medium">{data.sekolah?.nama || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Talenta</CardTitle>
              <CardDescription>{data.talentaList.length} talenta terdaftar</CardDescription>
            </div>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <IconPlus className="h-4 w-4 mr-1" />
              Tambah
            </Button>
          </CardHeader>
          <CardContent>
            {data.talentaList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada talenta</p>
            ) : (
              <div className="space-y-4">
                {data.talentaList.map((t) => (
                  <div key={t.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge>{jenisLabels[t.jenis]}</Badge>
                      <div className="flex items-center gap-2">
                        {t.isVerified ? (
                          <Badge variant="default" className="gap-1">
                            <IconCheck className="h-3 w-3" /> Terverifikasi
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Belum Verifikasi</Badge>
                        )}
                      </div>
                    </div>

                    {t.jenis === "peserta_pelatihan" && (
                      <div className="text-sm space-y-1">
                        <p><span className="text-muted-foreground">Kegiatan:</span> {t.namaKegiatan}</p>
                        <p><span className="text-muted-foreground">Penyelenggara:</span> {t.penyelenggaraKegiatan}</p>
                        <p><span className="text-muted-foreground">Tanggal:</span> {t.tanggalMulai ? new Date(t.tanggalMulai).toLocaleDateString("id-ID") : "-"}</p>
                        <p><span className="text-muted-foreground">Durasi:</span> {t.jangkaWaktu} hari</p>
                      </div>
                    )}

                    {(t.jenis === "pembimbing_lomba" || t.jenis === "peserta_lomba") && (
                      <div className="text-sm space-y-1">
                        <p><span className="text-muted-foreground">Lomba:</span> {t.namaLomba}</p>
                        <p><span className="text-muted-foreground">Jenjang:</span> {t.jenjang ? jenjangLabels[t.jenjang] : "-"}</p>
                        <p><span className="text-muted-foreground">Bidang:</span> {t.bidang ? bidangLabels[t.bidang] : "-"}</p>
                        <p><span className="text-muted-foreground">Prestasi:</span> {t.prestasi || "-"}</p>
                        {t.buktiUrl && (
                          <a href={t.buktiUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            Lihat Bukti
                          </a>
                        )}
                      </div>
                    )}

                    {t.jenis === "minat_bakat" && (
                      <div className="text-sm">
                        <p><span className="text-muted-foreground">Deskripsi:</span> {t.deskripsi}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {!t.isVerified ? (
                        <Button size="xs" onClick={() => handleVerify(t.id, true)}>
                          <IconCheck className="h-3 w-3 mr-1" /> Verifikasi
                        </Button>
                      ) : (
                        <Button size="xs" variant="outline" onClick={() => handleVerify(t.id, false)}>
                          <IconX className="h-3 w-3 mr-1" /> Batalkan
                        </Button>
                      )}
                      <Button size="xs" variant="destructive" onClick={() => setDeleteId(t.id)}>
                        <IconTrash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TalentaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        gtkId={data.id}
        onSuccess={() => {
          setDialogOpen(false);
          fetchData();
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Talenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTalenta}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
