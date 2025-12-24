"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function AdminHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1">
        <h1 className="text-sm font-medium">Sistem Informasi Manajemen Talenta GTK</h1>
      </div>
    </header>
  );
}
