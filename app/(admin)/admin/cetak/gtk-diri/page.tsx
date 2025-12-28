"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconUserCircle } from "@tabler/icons-react";

export default function CetakGtkDiriPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Cetak GTK Diri</h1>
                <p className="text-sm text-muted-foreground">Cetak profil dan talenta GTK individual</p>
            </div>

            <Card>
                <CardHeader className="text-center">
                    <IconUserCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                    <CardTitle>Fitur Dalam Pengembangan</CardTitle>
                    <CardDescription>
                        Halaman ini akan menampilkan fitur cetak profil GTK secara individual.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                    <p>Fitur yang akan tersedia:</p>
                    <ul className="mt-2 space-y-1">
                        <li>• Cari dan pilih GTK individual</li>
                        <li>• Lihat detail profil dan talenta</li>
                        <li>• Ekspor profil lengkap ke PDF</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
