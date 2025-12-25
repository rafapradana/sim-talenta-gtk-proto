"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  IconDashboard,
  IconSchool,
  IconUsers,
  IconUserCircle,
  IconAward,
  IconLogout,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const menuItems = [
  { title: "Dashboard", href: "/admin", icon: IconDashboard },
  { title: "Sekolah", href: "/admin/sekolah", icon: IconSchool },
  { title: "GTK", href: "/admin/gtk", icon: IconUserCircle },
  { title: "Talenta", href: "/admin/talenta", icon: IconAward },
  { title: "Users", href: "/admin/users", icon: IconUsers },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/logo-provinsi-jawa-timur.png"
            alt="Logo Provinsi Jawa Timur"
            width={40}
            height={40}
            className="object-contain"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">SIPODI</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Cabang Dinas Pendidikan Wilayah Malang<br />
              (Kota Malang - Kota Batu)
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <IconLogout className="h-4 w-4" />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
