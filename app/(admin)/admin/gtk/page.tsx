"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/data-table";
import { GtkDialog } from "@/components/admin/gtk-dialog";
import { IconPlus, IconPencil, IconTrash, IconEye, IconDownload } from "@tabler/icons-react";
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
import Link from "next/link";

interface Gtk {
  id: string;
  namaLengkap: string;
  nuptk: string | null;
  nip: string | null;
  kelamin: "L" | "P";
  jenis: "guru" | "tendik" | "kepala_sekolah";
  jabatan: string | null;
  sekolah?: { id: string; nama: string } | null;
  user?: { email: string };
  talentaList?: { id: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const jenisLabels: Record<string, string> = {
  guru: "Guru",
  tendik: "Tendik",
  kepala_sekolah: "Kepala Sekolah",
};

export default function GtkPage() {
  const [data, setData] = useState<Gtk[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<Gtk | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState("all");

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    if (jenis !== "all") params.set("jenis", jenis);

    const res = await fetch(`/api/gtk?${params}`);
    const json = await res.json();
    setData(json.data || []);
    setPagination(json.pagination);
    setLoading(false);
  }, [search, jenis]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/gtk/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchData();
  }

  const columns = [
    { key: "namaLengkap", header: "Nama Lengkap", cell: (row: Gtk) => row.namaLengkap },
    { key: "nuptk", header: "NUPTK", cell: (row: Gtk) => row.nuptk || "-" },
    { key: "nip", header: "NIP", cell: (row: Gtk) => row.nip || "-" },
    {
      key: "kelamin",
      header: "L/P",
      cell: (row: Gtk) => row.kelamin,
    },
    {
      key: "jenis",
      header: "Jenis",
      cell: (row: Gtk) => (
        <Badge variant="outline">{jenisLabels[row.jenis]}</Badge>
      ),
    },
    {
      key: "sekolah",
      header: "Sekolah",
      cell: (row: Gtk) => row.sekolah?.nama || "-",
    },
    {
      key: "talenta",
      header: "Talenta",
      cell: (row: Gtk) => row.talentaList?.length || 0,
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (row: Gtk) => (
        <div className="flex gap-1">
          <Link href={`/admin/gtk/${row.id}`}>
            <Button variant="ghost" size="icon-sm">
              <IconEye className="h-4 w-4" />
            </Button>
          </Link>
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
        <h1 className="text-2xl font-bold">Manajemen GTK</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/api/export/gtk?format=csv", "_blank")}>
            <IconDownload className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => { setEditData(null); setDialogOpen(true); }}>
            <IconPlus className="h-4 w-4 mr-2" />
            Tambah GTK
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        pagination={pagination || undefined}
        onPageChange={fetchData}
        loading={loading}
        searchPlaceholder="Cari nama GTK..."
        onSearch={setSearch}
        filters={[
          {
            key: "jenis",
            label: "Jenis",
            options: [
              { value: "all", label: "Semua Jenis" },
              { value: "guru", label: "Guru" },
              { value: "tendik", label: "Tendik" },
              { value: "kepala_sekolah", label: "Kepala Sekolah" },
            ],
            onChange: setJenis,
          },
        ]}
        emptyMessage="Belum ada data GTK"
      />

      <GtkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={editData}
        onSuccess={() => {
          setDialogOpen(false);
          fetchData();
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus GTK?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data GTK dan user terkait akan dihapus permanen.
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
