"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/data-table";
import { SekolahDialog } from "@/components/admin/sekolah-dialog";
import { ImportSekolahDialog } from "@/components/admin/import-sekolah-dialog";
import { IconPlus, IconPencil, IconTrash, IconDownload, IconUpload } from "@tabler/icons-react";
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

interface Sekolah {
  id: string;
  nama: string;
  npsn: string;
  status: "negeri" | "swasta";
  kota: "kota_malang" | "kota_batu";
  alamat: string;
  kepalaSekolah?: string | null;
  gtkList?: { id: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SekolahPage() {
  const [data, setData] = useState<Sekolah[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editData, setEditData] = useState<Sekolah | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [kota, setKota] = useState("all");

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (kota !== "all") params.set("kota", kota);

    const res = await fetch(`/api/sekolah?${params}`);
    const json = await res.json();
    setData(json.data || []);
    setPagination(json.pagination);
    setLoading(false);
  }, [search, status, kota]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/sekolah/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchData();
  }

  const columns = [
    { key: "nama", header: "Nama Sekolah", cell: (row: Sekolah) => row.nama },
    { key: "npsn", header: "NPSN", cell: (row: Sekolah) => row.npsn },
    {
      key: "status",
      header: "Status",
      cell: (row: Sekolah) => (
        <Badge variant={row.status === "negeri" ? "default" : "secondary"}>
          {row.status === "negeri" ? "Negeri" : "Swasta"}
        </Badge>
      ),
    },
    {
      key: "kota",
      header: "Kota",
      cell: (row: Sekolah) => (
        <Badge variant="outline">
          {row.kota === "kota_malang" ? "Kota Malang" : "Kota Batu"}
        </Badge>
      ),
    },
    {
      key: "kepalaSekolah",
      header: "Kepala Sekolah",
      cell: (row: Sekolah) => row.kepalaSekolah || "-",
    },
    {
      key: "jumlahGtk",
      header: "Jumlah GTK",
      cell: (row: Sekolah) => row.gtkList?.length || 0,
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (row: Sekolah) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setEditData(row);
              setDialogOpen(true);
            }}
          >
            <IconPencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(row.id)}>
            <IconTrash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Sekolah</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/api/export/sekolah?format=csv", "_blank")}>
            <IconDownload className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <IconUpload className="h-4 w-4 mr-2" />
            Import Excel
          </Button>
          <Button onClick={() => { setEditData(null); setDialogOpen(true); }}>
            <IconPlus className="h-4 w-4 mr-2" />
            Tambah Sekolah
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        pagination={pagination || undefined}
        onPageChange={fetchData}
        loading={loading}
        searchPlaceholder="Cari nama sekolah..."
        onSearch={setSearch}
        filters={[
          {
            key: "kota",
            label: "Kota",
            options: [
              { value: "all", label: "Semua Kota" },
              { value: "kota_malang", label: "Kota Malang" },
              { value: "kota_batu", label: "Kota Batu" },
            ],
            onChange: setKota,
          },
          {
            key: "status",
            label: "Status",
            options: [
              { value: "all", label: "Semua Status" },
              { value: "negeri", label: "Negeri" },
              { value: "swasta", label: "Swasta" },
            ],
            onChange: setStatus,
          },
        ]}
        emptyMessage="Belum ada data sekolah"
      />

      <SekolahDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={editData}
        onSuccess={() => {
          setDialogOpen(false);
          fetchData();
        }}
      />

      <ImportSekolahDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={() => {
          fetchData();
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Sekolah?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data sekolah akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
