"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/data-table";
import { UserDialog } from "@/components/admin/user-dialog";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";
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

interface User {
  id: string;
  email: string;
  role: "super_admin" | "admin_sekolah" | "gtk";
  isActive: boolean;
  createdAt: string;
  gtk?: {
    namaLengkap: string;
    sekolah?: { nama: string } | null;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin_sekolah: "Admin Sekolah",
  gtk: "GTK",
};

const roleColors: Record<string, "default" | "secondary" | "outline"> = {
  super_admin: "default",
  admin_sekolah: "secondary",
  gtk: "outline",
};

export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "40" });
    if (search) params.set("search", search);
    if (role !== "all") params.set("role", role);

    const res = await fetch(`/api/users?${params}`);
    const json = await res.json();
    setData(json.data || []);
    setPagination(json.pagination);
    setLoading(false);
  }, [search, role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchData();
  }

  const columns = [
    { key: "email", header: "Email", cell: (row: User) => row.email },
    {
      key: "role",
      header: "Role",
      cell: (row: User) => (
        <Badge variant={roleColors[row.role]}>{roleLabels[row.role]}</Badge>
      ),
    },
    {
      key: "gtk",
      header: "GTK",
      cell: (row: User) => row.gtk?.namaLengkap || "-",
    },
    {
      key: "sekolah",
      header: "Sekolah",
      cell: (row: User) => row.gtk?.sekolah?.nama || "-",
    },
    {
      key: "status",
      header: "Status",
      cell: (row: User) =>
        row.isActive ? (
          <Badge variant="default">Aktif</Badge>
        ) : (
          <Badge variant="secondary">Nonaktif</Badge>
        ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (row: User) => (
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
        <h1 className="text-2xl font-bold">Manajemen Users</h1>
        <Button onClick={() => { setEditData(null); setDialogOpen(true); }}>
          <IconPlus className="h-4 w-4 mr-2" />
          Tambah User
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        pagination={pagination || undefined}
        onPageChange={fetchData}
        loading={loading}
        searchPlaceholder="Cari email..."
        onSearch={setSearch}
        filters={[
          {
            key: "role",
            label: "Role",
            options: [
              { value: "all", label: "Semua Role" },
              { value: "super_admin", label: "Super Admin" },
              { value: "admin_sekolah", label: "Admin Sekolah" },
              { value: "gtk", label: "GTK" },
            ],
            onChange: setRole,
          },
        ]}
        emptyMessage="Belum ada data user"
      />

      <UserDialog
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
            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data user akan dihapus permanen.
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
