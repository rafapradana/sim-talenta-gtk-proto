"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IconSearch, IconPrinter, IconFileTypePdf, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface GtkData {
    id: string;
    namaLengkap: string;
    nuptk: string;
    nip: string;
    sekolah: string;
    jenis: string;
    jabatan: string;
    email: string;
    foto: string;
    talentaList: string[];
}

// Fake GTK Data for individual profile print
const fakeGtkData: GtkData[] = Array.from({ length: 30 }, (_, i) => ({
    id: `gtk-${i + 1}`,
    namaLengkap: [
        "Ahmad Suryanto, S.Pd.", "Siti Rahayu, M.Pd.", "Budi Santoso", "Dr. Handayani, M.Si.",
        "Dewi Lestari, S.Kom.", "Agus Wijaya, S.Pd.", "Rina Kartika, M.Hum.", "Joko Susilo",
        "Ani Widya, S.Pd.", "Bambang Prasetyo, M.Pd.", "Endang Purwati, S.Si.", "Heru Prabowo",
        "Maya Sari, S.Pd.", "Dedi Kurniawan", "Ika Susanti, M.Pd.", "Rudi Hartono, S.Pd.",
        "Sri Wahyuni", "Eko Prasetya, M.Pd.", "Nita Fitriani, S.Kom.", "Yanto Wibowo",
        "Ratna Dewi, S.Pd.", "Tono Wijaya", "Linda Sari, M.Pd.", "Andi Prasetyo, S.T.",
        "Wulan Sari", "Didik Hartono, S.Pd.", "Erni Susanti", "Fajar Nugroho, M.Pd.",
        "Gita Permata, S.Si.", "Hadi Susanto",
    ][i],
    nuptk: `${1234567890 + i}`,
    nip: `19${80 + (i % 10)}0${(i % 12) + 1}${10 + (i % 20)} 20${10 + (i % 10)}01 ${i % 2 + 1} 00${i + 1}`,
    sekolah: [
        "SMAN 1 Malang", "SMAN 3 Malang", "SMAN 5 Malang", "SMKN 2 Malang", "SMKN 4 Malang",
        "SMAN 8 Malang", "SMAN 10 Malang", "SMKN 6 Malang", "SMAN 1 Batu", "SMKN 8 Malang",
    ][i % 10],
    jenis: ["Guru", "Tendik", "Kepala Sekolah"][i % 3],
    jabatan: [
        "Guru Matematika", "Guru Bahasa Indonesia", "Kepala Sekolah", "Staf TU",
        "Guru Fisika", "Guru Kimia", "Wakil Kepala Sekolah", "Operator Sekolah",
        "Guru Biologi", "Guru Bahasa Inggris",
    ][i % 10],
    email: `${["ahmad", "siti", "budi", "handayani", "dewi", "agus", "rina", "joko", "ani", "bambang"][i % 10]}${i + 1}@sekolah.sch.id`,
    foto: `https://api.dicebear.com/7.x/avataaars/svg?seed=gtkdiri${i + 1}`,
    talentaList: [
        ["Peserta Pelatihan Kurikulum Merdeka", "Pembimbing OSN Matematika"],
        ["Peserta Workshop PBL", "Juara 1 Lomba Inovasi Guru"],
        ["Pembimbing Lomba Debat", "Peserta Diklat Kepemimpinan"],
        ["Peserta Seminar Pendidikan Digital"],
        ["Pembimbing FLS2N", "Pembimbing Paduan Suara", "Peserta Workshop Seni"],
    ][i % 5],
}));

export default function CetakGtkDiriPage() {
    const [search, setSearch] = useState("");
    const [sekolahFilter, setSekolahFilter] = useState("all");
    const [jenisFilter, setJenisFilter] = useState("all");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [printTitle, setPrintTitle] = useState("");
    const [printDescription, setPrintDescription] = useState("");

    const limit = 10;

    // Get unique schools for filter
    const sekolahOptions = [...new Set(fakeGtkData.map(g => g.sekolah))];

    // Filter data
    const filteredData = useMemo(() => {
        return fakeGtkData.filter((item) => {
            if (search) {
                const searchLower = search.toLowerCase();
                if (!item.namaLengkap.toLowerCase().includes(searchLower) &&
                    !item.nuptk.includes(search) &&
                    !item.nip.includes(search) &&
                    !item.jabatan.toLowerCase().includes(searchLower)) {
                    return false;
                }
            }
            if (sekolahFilter !== "all" && item.sekolah !== sekolahFilter) return false;
            if (jenisFilter !== "all" && item.jenis !== jenisFilter) return false;
            return true;
        });
    }, [search, sekolahFilter, jenisFilter]);

    // Paginate
    const paginatedData = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredData.slice(start, start + limit);
    }, [filteredData, page]);

    const totalPages = Math.ceil(filteredData.length / limit);

    // Selection handlers
    function toggleSelect(id: string) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    function toggleSelectAll() {
        if (selectedIds.size === filteredData.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredData.map(g => g.id)));
        }
    }

    // Get selected GTK data
    const selectedGtk = fakeGtkData.filter(g => selectedIds.has(g.id));

    function handleExportPdf() {
        alert(`Mengekspor PDF Profil GTK:\nJudul: ${printTitle}\nDeskripsi: ${printDescription}\nJumlah GTK: ${selectedIds.size}`);
        setIsModalOpen(false);
        setPrintTitle("");
        setPrintDescription("");
        setSelectedIds(new Set());
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Cetak GTK Diri</h1>
                    <p className="text-sm text-muted-foreground">Pilih GTK untuk mencetak profil lengkap individual</p>
                </div>
                {selectedIds.size > 0 && (
                    <Button onClick={() => setIsModalOpen(true)}>
                        <IconPrinter className="h-4 w-4 mr-2" />
                        Selanjutnya ({selectedIds.size} dipilih)
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama, NUPTK, NIP, atau jabatan..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Select value={sekolahFilter} onValueChange={(v) => { v && setSekolahFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-40">
                            <SelectValue>{sekolahFilter === "all" ? "Semua Sekolah" : sekolahFilter}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Sekolah</SelectItem>
                            {sekolahOptions.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={jenisFilter} onValueChange={(v) => { v && setJenisFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-36">
                            <SelectValue>{jenisFilter === "all" ? "Semua Jenis" : jenisFilter}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Jenis</SelectItem>
                            <SelectItem value="Guru">Guru</SelectItem>
                            <SelectItem value="Tendik">Tendik</SelectItem>
                            <SelectItem value="Kepala Sekolah">Kepala Sekolah</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>GTK</TableHead>
                            <TableHead>NUPTK</TableHead>
                            <TableHead>Sekolah</TableHead>
                            <TableHead>Jabatan</TableHead>
                            <TableHead className="text-center">Talenta</TableHead>
                            <TableHead className="w-12 text-right">
                                <Checkbox
                                    checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Tidak ada data yang sesuai
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((gtk) => (
                                <TableRow key={gtk.id} className={selectedIds.has(gtk.id) ? "bg-muted/50" : ""}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={gtk.foto} alt={gtk.namaLengkap} />
                                                <AvatarFallback>{gtk.namaLengkap.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{gtk.namaLengkap}</p>
                                                <p className="text-xs text-muted-foreground">{gtk.jenis}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{gtk.nuptk}</TableCell>
                                    <TableCell>{gtk.sekolah}</TableCell>
                                    <TableCell>{gtk.jabatan}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">{gtk.talentaList.length}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Checkbox
                                            checked={selectedIds.has(gtk.id)}
                                            onCheckedChange={() => toggleSelect(gtk.id)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, filteredData.length)} dari {filteredData.length}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                            <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
                            <IconChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Print Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Cetak Profil GTK</DialogTitle>
                        <DialogDescription>
                            Isi detail cetakan dan konfirmasi GTK yang akan dicetak profilnya
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Judul Cetak</Label>
                            <Input
                                placeholder="Contoh: Profil GTK SMAN 1 Malang"
                                value={printTitle}
                                onChange={(e) => setPrintTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Deskripsi Cetak</Label>
                            <Textarea
                                placeholder="Deskripsi atau catatan tambahan..."
                                value={printDescription}
                                onChange={(e) => setPrintDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>GTK yang Dipilih ({selectedIds.size})</Label>
                            <div className="max-h-64 overflow-y-auto rounded-md border divide-y">
                                {selectedGtk.map((gtk) => (
                                    <div key={gtk.id} className="p-3 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={gtk.foto} alt={gtk.namaLengkap} />
                                                <AvatarFallback>{gtk.namaLengkap.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium">{gtk.namaLengkap}</p>
                                                <p className="text-xs text-muted-foreground">{gtk.jabatan} • {gtk.sekolah}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {gtk.talentaList.map((t, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">{t}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                        <Button onClick={handleExportPdf} disabled={!printTitle}>
                            <IconFileTypePdf className="h-4 w-4 mr-2" />
                            Ekspor PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
