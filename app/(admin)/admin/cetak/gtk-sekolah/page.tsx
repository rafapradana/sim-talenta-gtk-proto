"use client";

import { useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { IconSearch, IconPrinter, IconFileTypePdf, IconChevronLeft, IconChevronRight, IconSchool } from "@tabler/icons-react";

interface SekolahData {
    id: string;
    nama: string;
    npsn: string;
    status: string;
    alamat: string;
    kepalaSekolah: string;
    jumlahGtk: number;
    jumlahTalenta: number;
}

// Fake Sekolah Data
const fakeSekolahData: SekolahData[] = [
    { id: "sekolah-1", nama: "SMAN 1 Malang", npsn: "20536481", status: "Negeri", alamat: "Jl. Tugu No. 1, Malang", kepalaSekolah: "Dr. Surya Wijaya, M.Pd.", jumlahGtk: 68, jumlahTalenta: 142 },
    { id: "sekolah-2", nama: "SMAN 3 Malang", npsn: "20536482", status: "Negeri", alamat: "Jl. Sultan Agung No. 7, Malang", kepalaSekolah: "Drs. Ahmad Basuki, M.M.", jumlahGtk: 72, jumlahTalenta: 156 },
    { id: "sekolah-3", nama: "SMAN 5 Malang", npsn: "20536483", status: "Negeri", alamat: "Jl. Tugu No. 22, Malang", kepalaSekolah: "Siti Aminah, S.Pd., M.Pd.", jumlahGtk: 55, jumlahTalenta: 98 },
    { id: "sekolah-4", nama: "SMAN 8 Malang", npsn: "20536484", status: "Negeri", alamat: "Jl. Veteran No. 15, Malang", kepalaSekolah: "Bambang Sutrisno, S.Pd.", jumlahGtk: 48, jumlahTalenta: 87 },
    { id: "sekolah-5", nama: "SMAN 10 Malang", npsn: "20536485", status: "Negeri", alamat: "Jl. Raya Langsep, Malang", kepalaSekolah: "Rina Kartika, M.Hum.", jumlahGtk: 42, jumlahTalenta: 76 },
    { id: "sekolah-6", nama: "SMKN 2 Malang", npsn: "20536486", status: "Negeri", alamat: "Jl. Veteran No. 17, Malang", kepalaSekolah: "Agus Hermawan, S.T., M.T.", jumlahGtk: 85, jumlahTalenta: 198 },
    { id: "sekolah-7", nama: "SMKN 4 Malang", npsn: "20536487", status: "Negeri", alamat: "Jl. Tanimbar No. 22, Malang", kepalaSekolah: "Dewi Lestari, S.Kom., M.Kom.", jumlahGtk: 78, jumlahTalenta: 165 },
    { id: "sekolah-8", nama: "SMKN 6 Malang", npsn: "20536488", status: "Negeri", alamat: "Jl. Ki Ageng Gribig, Malang", kepalaSekolah: "Joko Susilo, S.Pd.", jumlahGtk: 62, jumlahTalenta: 124 },
    { id: "sekolah-9", nama: "SMKN 8 Malang", npsn: "20536489", status: "Negeri", alamat: "Jl. Teluk Grajakan, Malang", kepalaSekolah: "Endang Purwati, S.Si.", jumlahGtk: 54, jumlahTalenta: 108 },
    { id: "sekolah-10", nama: "SMKN 11 Malang", npsn: "20536490", status: "Negeri", alamat: "Jl. Pelabuhan Bakahuni, Malang", kepalaSekolah: "Heru Prabowo, S.Pd.", jumlahGtk: 46, jumlahTalenta: 92 },
    { id: "sekolah-11", nama: "SMAN 1 Batu", npsn: "20536491", status: "Negeri", alamat: "Jl. Kartini No. 12, Batu", kepalaSekolah: "Maya Sari, S.Pd., M.Pd.", jumlahGtk: 52, jumlahTalenta: 104 },
    { id: "sekolah-12", nama: "SMAN 2 Batu", npsn: "20536492", status: "Negeri", alamat: "Jl. Dewi Sartika No. 5, Batu", kepalaSekolah: "Ika Susanti, M.Pd.", jumlahGtk: 38, jumlahTalenta: 68 },
    { id: "sekolah-13", nama: "SMKN 1 Batu", npsn: "20536493", status: "Negeri", alamat: "Jl. Hasanudin No. 8, Batu", kepalaSekolah: "Dedi Kurniawan, S.T.", jumlahGtk: 44, jumlahTalenta: 82 },
    { id: "sekolah-14", nama: "SLBN 1 Malang", npsn: "20536494", status: "Negeri", alamat: "Jl. Brigjend Slamet Riadi, Malang", kepalaSekolah: "Ani Widya, S.Pd., M.Pd.", jumlahGtk: 28, jumlahTalenta: 45 },
    { id: "sekolah-15", nama: "SLBN Pembina Malang", npsn: "20536495", status: "Negeri", alamat: "Jl. Dr. Cipto No. 14, Malang", kepalaSekolah: "Sri Wahyuni, S.Pd.", jumlahGtk: 32, jumlahTalenta: 58 },
];

export default function CetakGtkSekolahPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [printTitle, setPrintTitle] = useState("");
    const [printDescription, setPrintDescription] = useState("");

    const limit = 10;

    // Filter data
    const filteredData = useMemo(() => {
        return fakeSekolahData.filter((item) => {
            if (search) {
                const searchLower = search.toLowerCase();
                if (!item.nama.toLowerCase().includes(searchLower) &&
                    !item.npsn.includes(search) &&
                    !item.kepalaSekolah.toLowerCase().includes(searchLower)) {
                    return false;
                }
            }
            if (statusFilter !== "all" && item.status !== statusFilter) return false;
            return true;
        });
    }, [search, statusFilter]);

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
            setSelectedIds(new Set(filteredData.map(s => s.id)));
        }
    }

    // Get selected sekolah data
    const selectedSekolah = fakeSekolahData.filter(s => selectedIds.has(s.id));
    const totalGtkSelected = selectedSekolah.reduce((sum, s) => sum + s.jumlahGtk, 0);
    const totalTalentaSelected = selectedSekolah.reduce((sum, s) => sum + s.jumlahTalenta, 0);

    function handleExportPdf() {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Title
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(printTitle || "Rekapitulasi GTK Sekolah", pageWidth / 2, 20, { align: "center" });

        // Description
        if (printDescription) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(printDescription, pageWidth / 2, 28, { align: "center" });
        }

        // Date
        doc.setFontSize(9);
        doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, pageWidth / 2, 35, { align: "center" });

        // Table
        const tableData = selectedSekolah.map((s, idx) => [
            idx + 1,
            s.nama,
            s.npsn,
            s.kepalaSekolah,
            s.jumlahGtk,
            s.jumlahTalenta
        ]);

        autoTable(doc, {
            startY: 42,
            head: [["No", "Nama Sekolah", "NPSN", "Kepala Sekolah", "GTK", "Talenta"]],
            body: tableData,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [59, 130, 246] },
        });

        // Footer
        const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
        doc.setFontSize(9);
        doc.text(`Total Sekolah: ${selectedSekolah.length}`, 14, finalY);
        doc.text(`Total GTK: ${totalGtkSelected}`, 14, finalY + 5);
        doc.text(`Total Talenta: ${totalTalentaSelected}`, 14, finalY + 10);

        doc.save(`rekapitulasi-gtk-sekolah-${Date.now()}.pdf`);

        setIsModalOpen(false);
        setPrintTitle("");
        setPrintDescription("");
        setSelectedIds(new Set());
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Cetak GTK Sekolah</h1>
                    <p className="text-sm text-muted-foreground">Pilih sekolah untuk mencetak rekapitulasi GTK</p>
                </div>
                {selectedIds.size > 0 && (
                    <Button onClick={() => setIsModalOpen(true)}>
                        <IconPrinter className="h-4 w-4 mr-2" />
                        Selanjutnya ({selectedIds.size} sekolah)
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama sekolah, NPSN, atau kepala sekolah..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={(v) => { v && setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-36">
                            <SelectValue>{statusFilter === "all" ? "Semua Status" : statusFilter}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="Negeri">Negeri</SelectItem>
                            <SelectItem value="Swasta">Swasta</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sekolah</TableHead>
                            <TableHead>NPSN</TableHead>
                            <TableHead>Kepala Sekolah</TableHead>
                            <TableHead className="text-center">GTK</TableHead>
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
                            paginatedData.map((sekolah) => (
                                <TableRow key={sekolah.id} className={selectedIds.has(sekolah.id) ? "bg-muted/50" : ""}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                                <IconSchool className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{sekolah.nama}</p>
                                                <p className="text-xs text-muted-foreground">{sekolah.alamat}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{sekolah.npsn}</TableCell>
                                    <TableCell>{sekolah.kepalaSekolah}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">{sekolah.jumlahGtk}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline">{sekolah.jumlahTalenta}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Checkbox
                                            checked={selectedIds.has(sekolah.id)}
                                            onCheckedChange={() => toggleSelect(sekolah.id)}
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
                        <DialogTitle>Cetak Rekapitulasi GTK Sekolah</DialogTitle>
                        <DialogDescription>
                            Isi detail cetakan dan konfirmasi sekolah yang akan dicetak
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Judul Cetak</Label>
                            <Input
                                placeholder="Contoh: Rekapitulasi GTK Sekolah Wilayah Malang"
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

                        <div className="grid grid-cols-2 gap-4 p-3 rounded-md bg-muted/50">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">{totalGtkSelected}</p>
                                <p className="text-xs text-muted-foreground">Total GTK</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">{totalTalentaSelected}</p>
                                <p className="text-xs text-muted-foreground">Total Talenta</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Sekolah yang Dipilih ({selectedIds.size})</Label>
                            <div className="max-h-48 overflow-y-auto rounded-md border p-2 space-y-2">
                                {selectedSekolah.map((sekolah) => (
                                    <div key={sekolah.id} className="flex items-center gap-3 py-1">
                                        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
                                            <IconSchool className="h-3 w-3 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{sekolah.nama}</p>
                                            <p className="text-xs text-muted-foreground">{sekolah.kepalaSekolah}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">{sekolah.jumlahGtk} GTK</Badge>
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
