"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconSchool, IconUserCircle, IconAward, IconAlertCircle } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis, CartesianGrid, Cell, LabelList } from "recharts";

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

// ========== FAKE DATA FOR CHARTS ==========
const jenisTalentaData = [
  { name: "Peserta Pelatihan", value: 245, fill: "#3b82f6" },
  { name: "Pembimbing Lomba", value: 132, fill: "#10b981" },
  { name: "Peserta Lomba", value: 189, fill: "#f59e0b" },
  { name: "Minat/Bakat", value: 98, fill: "#ef4444" },
];

const bidangTalentaData = [
  { name: "Akademik", value: 156, fill: "#3b82f6" },
  { name: "Inovasi", value: 89, fill: "#10b981" },
  { name: "Teknologi", value: 124, fill: "#8b5cf6" },
  { name: "Sosial", value: 67, fill: "#f59e0b" },
  { name: "Seni", value: 78, fill: "#ec4899" },
  { name: "Sastra", value: 45, fill: "#14b8a6" },
  { name: "Kepemimpinan", value: 92, fill: "#f97316" },
  { name: "Lainnya", value: 34, fill: "#6b7280" },
];

const gtkJenjangData = [
  { name: "SMA", value: 342, fill: "#3b82f6" },
  { name: "SMK", value: 498, fill: "#10b981" },
  { name: "SLB", value: 87, fill: "#f59e0b" },
];

const gtkKotaData = [
  { name: "Kota Malang", value: 678, fill: "#8b5cf6" },
  { name: "Kota Batu", value: 249, fill: "#ec4899" },
];

// ========== CHART CONFIGS ==========
const jenisTalentaConfig: ChartConfig = {
  "Peserta Pelatihan": { label: "Peserta Pelatihan", color: "#3b82f6" },
  "Pembimbing Lomba": { label: "Pembimbing Lomba", color: "#10b981" },
  "Peserta Lomba": { label: "Peserta Lomba", color: "#f59e0b" },
  "Minat/Bakat": { label: "Minat/Bakat", color: "#ef4444" },
};

const bidangTalentaConfig: ChartConfig = {
  Akademik: { label: "Akademik", color: "#3b82f6" },
  Inovasi: { label: "Inovasi", color: "#10b981" },
  Teknologi: { label: "Teknologi", color: "#8b5cf6" },
  Sosial: { label: "Sosial", color: "#f59e0b" },
  Seni: { label: "Seni", color: "#ec4899" },
  Sastra: { label: "Sastra", color: "#14b8a6" },
  Kepemimpinan: { label: "Kepemimpinan", color: "#f97316" },
  Lainnya: { label: "Lainnya", color: "#6b7280" },
};

const gtkJenjangConfig: ChartConfig = {
  SMA: { label: "SMA", color: "#3b82f6" },
  SMK: { label: "SMK", color: "#10b981" },
  SLB: { label: "SLB", color: "#f59e0b" },
};

const gtkKotaConfig: ChartConfig = {
  "Kota Malang": { label: "Kota Malang", color: "#8b5cf6" },
  "Kota Batu": { label: "Kota Batu", color: "#ec4899" },
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
      <div className="space-y-8 p-6">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 p-6 min-w-0">
      {/* Stat Cards */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Statistik Umum</h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <IconSchool className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Sekolah</p>
                  <p className="text-lg font-bold">127</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10">
                  <IconUserCircle className="h-4 w-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">GTK</p>
                  <p className="text-lg font-bold">1,842</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-500/10">
                  <IconAward className="h-4 w-4 text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Talenta</p>
                  <p className="text-lg font-bold">664</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-500/10">
                  <IconAlertCircle className="h-4 w-4 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-muted-foreground">Visualisasi Data (Demo)</h2>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Bar Chart: Jenis Talenta */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Jenis Talenta</CardTitle>
              <CardDescription>Distribusi talenta berdasarkan jenis kegiatan</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <ChartContainer config={jenisTalentaConfig} className="h-[280px] w-full">
                <BarChart data={jenisTalentaData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {jenisTalentaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="value" position="right" className="fill-foreground text-xs" />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Bar Chart: Bidang Talenta */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bidang Talenta</CardTitle>
              <CardDescription>Distribusi talenta berdasarkan bidang keahlian</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <ChartContainer config={bidangTalentaConfig} className="h-[280px] w-full">
                <BarChart data={bidangTalentaData} margin={{ left: 10, right: 10, bottom: 20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {bidangTalentaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="value" position="top" className="fill-foreground text-xs" />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pie Chart: GTK per Jenjang */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Jumlah GTK per Jenjang</CardTitle>
              <CardDescription>Distribusi GTK berdasarkan jenjang pendidikan</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <ChartContainer config={gtkJenjangConfig} className="h-[280px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={gtkJenjangData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {gtkJenjangData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="name"
                      position="outside"
                      className="fill-foreground text-xs"
                      stroke="none"
                    />
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pie Chart: GTK per Kota */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Jumlah GTK per Kota</CardTitle>
              <CardDescription>Distribusi GTK berdasarkan wilayah kota</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <ChartContainer config={gtkKotaConfig} className="h-[280px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={gtkKotaData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {gtkKotaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="name"
                      position="outside"
                      className="fill-foreground text-xs"
                      stroke="none"
                    />
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Data Tables Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-muted-foreground">Data Terbaru</h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">GTK per Jenis</CardTitle>
              <CardDescription>Distribusi GTK berdasarkan jenis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Guru</span>
                  <Badge variant="secondary">1,245</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tendik</span>
                  <Badge variant="secondary">432</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Kepala Sekolah</span>
                  <Badge variant="secondary">127</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Talenta per Jenis</CardTitle>
              <CardDescription>Distribusi talenta berdasarkan jenis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Peserta Pelatihan</span>
                  <Badge variant="secondary">245</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pembimbing Lomba</span>
                  <Badge variant="secondary">132</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Peserta Lomba</span>
                  <Badge variant="secondary">189</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Minat/Bakat</span>
                  <Badge variant="secondary">98</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">GTK Terbaru</CardTitle>
              <CardDescription>5 GTK yang baru ditambahkan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">Ahmad Suryanto, S.Pd.</p>
                    <p className="text-xs text-muted-foreground">SMAN 1 Malang</p>
                  </div>
                  <Badge variant="outline">Guru</Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">Siti Rahayu, M.Pd.</p>
                    <p className="text-xs text-muted-foreground">SMKN 4 Malang</p>
                  </div>
                  <Badge variant="outline">Guru</Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">Budi Santoso</p>
                    <p className="text-xs text-muted-foreground">SMAN 3 Batu</p>
                  </div>
                  <Badge variant="outline">Tendik</Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">Dr. Handayani, M.Si.</p>
                    <p className="text-xs text-muted-foreground">SMAN 5 Malang</p>
                  </div>
                  <Badge variant="outline">Kepala Sekolah</Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">Dewi Lestari, S.Kom.</p>
                    <p className="text-xs text-muted-foreground">SMKN 2 Malang</p>
                  </div>
                  <Badge variant="outline">Guru</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
