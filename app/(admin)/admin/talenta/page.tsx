"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/data-table";
import { IconCheck, IconX, IconExternalLink, IconDownload } from "@tabler/icons-react";
import Link from "next/link";

interface Talenta {
  id: string;
  jenis: string;
  namaKegiatan?: string | null;
  namaLomba?: string | null;
  jenjang?: string | null;
  bidang?: string | null;
  prestasi?: string | null;
  deskripsi?: string | null;
  isVerified: boolean;
  gtk?: {
    id: string;
    namaLengkap: string;
    sekolah?: { nama: string } | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const jenisLabels: Record<string, string> = {
  peserta_pelatihan: "Peserta Pelatihan",
  pembimbing_lomba: "Pembimbing Lomba",
  peserta_lomba: "Peserta Lomba",
  minat_bakat: "Minat/Bakat",
};

export default function TalentaPage() {
  const [data, setData] = useState<Talenta[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [jenis, setJenis] = useState("all");
  const [verified, setVerified] = useState("all");

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "40" });
    if (jenis !== "all") params.set("jenis", jenis);
    if (verified !== "all") params.set("verified", verified);

    const res = await fetch(`/api/talenta?${params}`);
    const json = await res.json();
    setData(json.data || []);
    setPagination(json.pagination);
    setLoading(false);
  }, [jenis, verified]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleVerify(id: string, verify: boolean) {
    await fetch(`/api/talenta/${id}/verify`, {
      method: verify ? "POST" : "DELETE",
    });
    fetchData();
  }

  const columns = [
    {
      key: "gtk",
      header: "GTK",
      cell: (row: Talenta) => (
        <div>
          <Link href={`/admin/gtk/${row.gtk?.id}`} className="font-medium hover:underline">
            {row.gtk?.namaLengkap}
          </Link>
          <p className="text-xs text-muted-foreground">{row.gtk?.sekolah?.nama || "-"}</p>
        </div>
      ),
    },
    {
      key: "jenis",
      header: "Jenis",
      cell: (row: Talenta) => <Badge variant="outline">{jenisLabels[row.jenis]}</Badge>,
    },
    {
      key: "detail",
      header: "Detail",
      cell: (row: Talenta) => {
        if (row.jenis === "peserta_pelatihan") return row.namaKegiatan;
        if (row.jenis === "pembimbing_lomba" || row.jenis === "peserta_lomba") {
          return (
            <div>
              <p>{row.namaLomba}</p>
              <p className="text-xs text-muted-foreground">{row.prestasi || "-"}</p>
            </div>
          );
        }
        return row.deskripsi?.substring(0, 50) + "...";
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (row: Talenta) =>
        row.isVerified ? (
          <Badge variant="default" className="gap-1">
            <IconCheck className="h-3 w-3" /> Terverifikasi
          </Badge>
        ) : (
          <Badge variant="secondary">Belum Verifikasi</Badge>
        ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (row: Talenta) => (
        <div className="flex gap-1">
          {!row.isVerified ? (
            <Button size="xs" onClick={() => handleVerify(row.id, true)}>
              <IconCheck className="h-3 w-3 mr-1" /> Verifikasi
            </Button>
          ) : (
            <Button size="xs" variant="outline" onClick={() => handleVerify(row.id, false)}>
              <IconX className="h-3 w-3 mr-1" /> Batalkan
            </Button>
          )}
          <Link href={`/admin/gtk/${row.gtk?.id}`}>
            <Button variant="ghost" size="icon-xs">
              <IconExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Talenta</h1>
        <Button variant="outline" onClick={() => window.open("/api/export/talenta?format=csv", "_blank")}>
          <IconDownload className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        pagination={pagination || undefined}
        onPageChange={fetchData}
        loading={loading}
        filters={[
          {
            key: "jenis",
            label: "Jenis",
            options: [
              { value: "all", label: "Semua Jenis" },
              { value: "peserta_pelatihan", label: "Peserta Pelatihan" },
              { value: "pembimbing_lomba", label: "Pembimbing Lomba" },
              { value: "peserta_lomba", label: "Peserta Lomba" },
              { value: "minat_bakat", label: "Minat/Bakat" },
            ],
            onChange: setJenis,
          },
          {
            key: "verified",
            label: "Status",
            options: [
              { value: "all", label: "Semua Status" },
              { value: "true", label: "Terverifikasi" },
              { value: "false", label: "Belum Verifikasi" },
            ],
            onChange: setVerified,
          },
        ]}
        emptyMessage="Belum ada data talenta"
      />
    </div>
  );
}
