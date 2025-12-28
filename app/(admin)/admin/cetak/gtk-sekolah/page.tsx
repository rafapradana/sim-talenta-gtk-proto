"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconSchool } from "@tabler/icons-react";

export default function CetakGtkSekolahPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Cetak GTK Sekolah</h1>
                <p className="text-sm text-muted-foreground">Cetak rekapitulasi GTK berdasarkan sekolah</p>
            </div>

            <Card>
                <CardHeader className="text-center">
                    <IconSchool className="h-12 w-12 mx-auto text-muted-foreground" />
                    <CardTitle>Fitur Dalam Pengembangan</CardTitle>
                    <CardDescription>
                        Halaman ini akan menampilkan fitur cetak rekapitulasi GTK berdasarkan sekolah.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                    <p>Fitur yang akan tersedia:</p>
                    <ul className="mt-2 space-y-1">
                        <li>• Pilih sekolah untuk melihat daftar GTK</li>
                        <li>• Filter berdasarkan jenis GTK</li>
                        <li>• Ekspor laporan per sekolah ke PDF</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
