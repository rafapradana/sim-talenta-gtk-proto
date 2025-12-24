"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconUsers, IconSchool, IconUserCircle, IconAward, IconAlertCircle } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  stats: {
    totalUsers: number;
    totalSekolah: number;
    totalGtk: number;
    totalTalenta: number;
    unverifiedTalenta: number;
  };
  gtkByJenis: { jenis: string; count: number }[];
  talentaByJenis: { jenis: string; count: number }[];
  sekolahByStatus: { status: string; count: number }[];
  recentGtk: { id: string; namaLengkap: string; jenis: string; sekolah?: { nama: string } }[];
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

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <IconSchool className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sekolah</p>
                <p className="text-2xl font-bold">{data.stats.totalSekolah}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <IconUserCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total GTK</p>
                <p className="text-2xl font-bold">{data.stats.totalGtk}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <IconAward className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Talenta</p>
                <p className="text-2xl font-bold">{data.stats.totalTalenta}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                <IconAlertCircle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Belum Verifikasi</p>
                <p className="text-2xl font-bold">{data.stats.unverifiedTalenta}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <IconUsers className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{data.stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>GTK per Jenis</CardTitle>
            <CardDescription>Distribusi GTK berdasarkan jenis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.gtkByJenis.map((item) => (
                <div key={item.jenis} className="flex items-center justify-between">
                  <span className="text-sm">{jenisLabels[item.jenis] || item.jenis}</span>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
              {data.gtkByJenis.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Talenta per Jenis</CardTitle>
            <CardDescription>Distribusi talenta berdasarkan jenis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.talentaByJenis.map((item) => (
                <div key={item.jenis} className="flex items-center justify-between">
                  <span className="text-sm">{jenisLabels[item.jenis] || item.jenis}</span>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
              {data.talentaByJenis.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GTK Terbaru</CardTitle>
            <CardDescription>5 GTK yang baru ditambahkan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentGtk.map((gtk) => (
                <div key={gtk.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{gtk.namaLengkap}</p>
                    <p className="text-xs text-muted-foreground">{gtk.sekolah?.nama || "-"}</p>
                  </div>
                  <Badge variant="outline">{jenisLabels[gtk.jenis]}</Badge>
                </div>
              ))}
              {data.recentGtk.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
