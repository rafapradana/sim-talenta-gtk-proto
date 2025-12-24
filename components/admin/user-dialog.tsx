"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { IconLoader2 } from "@tabler/icons-react";

interface User {
  id: string;
  email: string;
  role: "super_admin" | "admin_sekolah" | "gtk";
  isActive: boolean;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: User | null;
  onSuccess: () => void;
}

export function UserDialog({ open, onOpenChange, data, onSuccess }: UserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isActive, setIsActive] = useState(data?.isActive ?? true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      email: formData.get("email"),
      role: formData.get("role"),
    };

    if (!data) {
      body.password = formData.get("password");
    } else {
      body.isActive = isActive;
      const password = formData.get("password") as string;
      if (password) body.password = password;
    }

    try {
      const res = await fetch(data ? `/api/users/${data.id}` : "/api/users", {
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
          <DialogTitle>{data ? "Edit User" : "Tambah User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={data?.email} required disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password {data && "(kosongkan jika tidak diubah)"}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required={!data}
              disabled={loading}
              placeholder={data ? "••••••••" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue={data?.role || "gtk"} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin_sekolah">Admin Sekolah</SelectItem>
                <SelectItem value="gtk">GTK</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {data && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked === true)}
                disabled={loading}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                User Aktif
              </Label>
            </div>
          )}

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
