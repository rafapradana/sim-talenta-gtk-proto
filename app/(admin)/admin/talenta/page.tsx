"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/data-table";
import { IconCheck, IconX, IconExternalLink, IconDownload, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface GtkOption {
  id: string;
  namaLengkap: string;
  nuptk: string;
  sekolah: string;
  jenis: string;
  foto: string;
}

interface Talenta {
  id: string;
  jenis: string;
  namaKegiatan?: string | null;
  namaLomba?: string | null;
  jenjang?: string | null;
  bidang?: string | null;
  prestasi?: string | null;
  deskripsi?: string | null;
  isVerified: boolean;
  gtk?: {
    id: string;
    namaLengkap: string;
    foto?: string;
    sekolah?: { nama: string } | null;
  };
}

const jenisLabels: Record<string, string> = {
  peserta_pelatihan: "Peserta Pelatihan",
  pembimbing_lomba: "Pembimbing Lomba",
  peserta_lomba: "Peserta Lomba",
  minat_bakat: "Minat/Bakat",
};

const bidangOptions = ["Akademik", "Inovasi", "Teknologi", "Sosial", "Seni", "Sastra", "Olahraga", "Kepemimpinan", "Lainnya"];
const jenjangOptions = ["Kota", "Provinsi", "Nasional", "Internasional"];

// ========== FAKE GTK DATA WITH PHOTOS (50 entries) ==========
const gtkList: GtkOption[] = Array.from({ length: 50 }, (_, i) => ({
  id: `gtk-${i + 1}`,
  namaLengkap: [
    "Ahmad Suryanto, S.Pd.", "Siti Rahayu, M.Pd.", "Budi Santoso", "Dr. Handayani, M.Si.",
    "Dewi Lestari, S.Kom.", "Agus Wijaya, S.Pd.", "Rina Kartika, M.Hum.", "Joko Susilo",
    "Ani Widya, S.Pd.", "Bambang Prasetyo, M.Pd.", "Endang Purwati, S.Si.", "Heru Prabowo",
    "Maya Sari, S.Pd.", "Dedi Kurniawan", "Ika Susanti, M.Pd.", "Rudi Hartono, S.Pd.",
    "Sri Wahyuni", "Eko Prasetya, M.Pd.", "Nita Fitriani, S.Kom.", "Yanto Wibowo",
    "Ratna Dewi, S.Pd.", "Tono Wijaya", "Linda Sari, M.Pd.", "Andi Prasetyo, S.T.",
    "Wulan Sari", "Didik Hartono, S.Pd.", "Erni Susanti", "Fajar Nugroho, M.Pd.",
    "Gita Permata, S.Si.", "Hadi Susanto", "Indra Wijaya, S.Pd.", "Juwita Sari, M.Pd.",
    "Kusuma Dewi", "Lestari Ningrum, S.Pd.", "Mulyono, S.T.", "Nurhayati, M.Pd.",
    "Oktaviani, S.Kom.", "Prasetyo Adi", "Qomariyah, S.Pd.", "Rahmat Hidayat",
    "Susanto, M.Pd.", "Tuti Wulandari", "Umar Faruq, S.Pd.", "Vina Amelia",
    "Wahyu Santoso, M.Pd.", "Xaverius Slamet", "Yuli Astuti, S.Pd.", "Zainal Abidin",
    "Aisyah Putri, S.Pd.", "Bayu Setiawan, M.Pd.",
  ][i % 50],
  nuptk: `${1234567890 + i}`,
  sekolah: [
    "SMAN 1 Malang", "SMAN 3 Malang", "SMAN 5 Malang", "SMKN 2 Malang", "SMKN 4 Malang",
    "SMAN 8 Malang", "SMAN 10 Malang", "SMKN 6 Malang", "SMAN 1 Batu", "SMKN 8 Malang",
  ][i % 10],
  jenis: ["Guru", "Tendik", "Kepala Sekolah"][i % 3],
  foto: `https://api.dicebear.com/7.x/avataaars/svg?seed=gtk${i + 1}`,
}));

const sekolahNames = [
  "SMAN 1 Malang", "SMAN 3 Malang", "SMAN 5 Malang", "SMAN 8 Malang", "SMAN 10 Malang",
  "SMKN 2 Malang", "SMKN 4 Malang", "SMKN 6 Malang", "SMKN 8 Malang", "SMKN 11 Malang",
  "SMAN 1 Batu", "SMAN 2 Batu", "SMKN 1 Batu", "SLBN 1 Malang", "SLBN Pembina Malang",
];

const kegiatanNames = [
  "Workshop Kurikulum Merdeka", "Pelatihan Pembelajaran Digital", "Diklat Guru Penggerak",
  "Seminar Pendidikan Inklusi", "Workshop Project Based Learning", "Pelatihan HOTS Assessment",
  "Diklat Kepemimpinan", "Workshop Blended Learning", "Pelatihan ICT untuk Guru",
];

const lombaNames = [
  "Olimpiade Sains Nasional", "Lomba Karya Ilmiah Remaja", "Festival Seni Pelajar",
  "Lomba Debat Bahasa Inggris", "Kompetisi Robotik", "Lomba Inovasi Teknologi",
  "Olimpiade Matematika", "Lomba Cerdas Cermat", "Festival Film Pendek",
];

const prestasiOptions = ["Juara 1", "Juara 2", "Juara 3", "Harapan 1", "Harapan 2", "Finalis", "Peserta Terbaik"];

function generateFakeData(count: number): Talenta[] {
  const data: Talenta[] = [];
  const jenisTypes = ["peserta_pelatihan", "pembimbing_lomba", "peserta_lomba", "minat_bakat"];

  for (let i = 0; i < count; i++) {
    const jenis = jenisTypes[Math.floor(Math.random() * jenisTypes.length)];
    const gtkData = gtkList[Math.floor(Math.random() * gtkList.length)];
    const isVerified = Math.random() > 0.3;

    const talenta: Talenta = {
      id: `talenta-${i + 1}`,
      jenis,
      isVerified,
      gtk: {
        id: gtkData.id,
        namaLengkap: gtkData.namaLengkap,
        foto: gtkData.foto,
        sekolah: { nama: gtkData.sekolah },
      },
    };

    if (jenis === "peserta_pelatihan") {
      talenta.namaKegiatan = kegiatanNames[Math.floor(Math.random() * kegiatanNames.length)];
    } else if (jenis === "pembimbing_lomba" || jenis === "peserta_lomba") {
      talenta.namaLomba = lombaNames[Math.floor(Math.random() * lombaNames.length)];
      talenta.jenjang = jenjangOptions[Math.floor(Math.random() * jenjangOptions.length)];
      talenta.bidang = bidangOptions[Math.floor(Math.random() * bidangOptions.length)];
      talenta.prestasi = prestasiOptions[Math.floor(Math.random() * prestasiOptions.length)];
    } else {
      talenta.deskripsi = `Memiliki minat dan bakat di bidang ${bidangOptions[Math.floor(Math.random() * bidangOptions.length)].toLowerCase()} dengan pengalaman yang cukup baik.`;
    }

    data.push(talenta);
  }

  return data;
}

const FAKE_DATA = generateFakeData(200);

export default function TalentaPage() {
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState("all");
  const [verified, setVerified] = useState("all");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formJenis, setFormJenis] = useState("");
  const [formGtk, setFormGtk] = useState("");
  const [formJenjang, setFormJenjang] = useState("");
  const [formBidang, setFormBidang] = useState("");
  const [gtkSearch, setGtkSearch] = useState("");

  // Filter GTK list for combobox
  const filteredGtkList = useMemo(() => {
    if (!gtkSearch) return gtkList;
    const searchLower = gtkSearch.toLowerCase();
    return gtkList.filter(
      (gtk) =>
        gtk.namaLengkap.toLowerCase().includes(searchLower) ||
        gtk.sekolah.toLowerCase().includes(searchLower) ||
        gtk.nuptk.includes(gtkSearch)
    );
  }, [gtkSearch]);

  // Get selected GTK name for display
  const selectedGtkData = useMemo(() => {
    if (!formGtk) return null;
    return gtkList.find(g => g.id === formGtk);
  }, [formGtk]);

  const limit = 20;

  // Filter and search data
  const filteredData = useMemo(() => {
    return FAKE_DATA.filter((item) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchName = item.gtk?.namaLengkap.toLowerCase().includes(searchLower);
        const matchSekolah = item.gtk?.sekolah?.nama.toLowerCase().includes(searchLower);
        const matchKegiatan = item.namaKegiatan?.toLowerCase().includes(searchLower);
        const matchLomba = item.namaLomba?.toLowerCase().includes(searchLower);
        if (!matchName && !matchSekolah && !matchKegiatan && !matchLomba) return false;
      }
      // Jenis filter
      if (jenis !== "all" && item.jenis !== jenis) return false;
      // Verified filter
      if (verified === "true" && !item.isVerified) return false;
      if (verified === "false" && item.isVerified) return false;
      return true;
    });
  }, [search, jenis, verified]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredData.slice(start, start + limit);
  }, [filteredData, page]);

  const pagination = {
    page,
    limit,
    total: filteredData.length,
    totalPages: Math.ceil(filteredData.length / limit),
  };

  function handleVerify(id: string, verify: boolean) {
    // In real app, this would call API
    console.log(`${verify ? "Verifying" : "Unverifying"} talenta ${id}`);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  const columns = [
    {
      key: "gtk",
      header: "GTK",
      cell: (row: Talenta) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.gtk?.foto} alt={row.gtk?.namaLengkap} />
            <AvatarFallback>{row.gtk?.namaLengkap?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/admin/gtk/${row.gtk?.id}`} className="font-medium hover:underline">
              {row.gtk?.namaLengkap}
            </Link>
            <p className="text-xs text-muted-foreground">{row.gtk?.sekolah?.nama || "-"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "jenis",
      header: "Jenis",
      cell: (row: Talenta) => <Badge variant="outline">{jenisLabels[row.jenis]}</Badge>,
    },
    {
      key: "detail",
      header: "Detail",
      cell: (row: Talenta) => {
        if (row.jenis === "peserta_pelatihan") return row.namaKegiatan;
        if (row.jenis === "pembimbing_lomba" || row.jenis === "peserta_lomba") {
          return (
            <div>
              <p>{row.namaLomba}</p>
              <p className="text-xs text-muted-foreground">{row.prestasi || "-"}</p>
            </div>
          );
        }
        return row.deskripsi?.substring(0, 50) + "...";
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (row: Talenta) =>
        row.isVerified ? (
          <Badge variant="default" className="gap-1">
            <IconCheck className="h-3 w-3" /> Terverifikasi
          </Badge>
        ) : (
          <Badge variant="secondary">Belum Verifikasi</Badge>
        ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (row: Talenta) => (
        <div className="flex gap-1">
          {!row.isVerified ? (
            <Button size="xs" onClick={() => handleVerify(row.id, true)}>
              <IconCheck className="h-3 w-3 mr-1" /> Verifikasi
            </Button>
          ) : (
            <Button size="xs" variant="outline" onClick={() => handleVerify(row.id, false)}>
              <IconX className="h-3 w-3 mr-1" /> Batalkan
            </Button>
          )}
          <Link href={`/admin/gtk/${row.gtk?.id}`}>
            <Button variant="ghost" size="icon-xs">
              <IconExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Talenta</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)}>
            <IconPlus className="h-4 w-4 mr-2" />
            Tambah Talenta
          </Button>
          <Button variant="outline" onClick={() => window.open("/api/export/talenta?format=csv", "_blank")}>
            <IconDownload className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        pagination={pagination}
        onPageChange={setPage}
        loading={false}
        searchPlaceholder="Cari GTK, sekolah, atau kegiatan..."
        onSearch={handleSearch}
        filters={[
          {
            key: "jenis",
            label: "Jenis",
            value: jenis,
            options: [
              { value: "all", label: "Semua Jenis" },
              { value: "peserta_pelatihan", label: "Peserta Pelatihan" },
              { value: "pembimbing_lomba", label: "Pembimbing Lomba" },
              { value: "peserta_lomba", label: "Peserta Lomba" },
              { value: "minat_bakat", label: "Minat/Bakat" },
            ],
            onChange: (v) => { setJenis(v); setPage(1); },
          },
          {
            key: "verified",
            label: "Status",
            value: verified,
            options: [
              { value: "all", label: "Semua Status" },
              { value: "true", label: "Terverifikasi" },
              { value: "false", label: "Belum Verifikasi" },
            ],
            onChange: (v) => { setVerified(v); setPage(1); },
          },
        ]}
        emptyMessage="Tidak ada data talenta yang sesuai"
      />

      {/* Create Talenta Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Talenta Baru</DialogTitle>
            <DialogDescription>Isi form berikut untuk menambahkan data talenta GTK.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gtk">GTK</Label>
              <Combobox
                value={formGtk}
                onValueChange={(v) => {
                  if (v) {
                    setFormGtk(v);
                    // Set search to selected name
                    const selected = gtkList.find(g => g.id === v);
                    if (selected) setGtkSearch(selected.namaLengkap);
                  }
                }}
              >
                <ComboboxInput
                  placeholder="Cari nama GTK..."
                  className="w-full"
                  value={gtkSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setGtkSearch(e.target.value);
                    // Clear selection if user is typing something new
                    if (formGtk && gtkSearch !== e.target.value) {
                      setFormGtk("");
                    }
                  }}
                />
                <ComboboxContent>
                  <ComboboxList>
                    <ComboboxEmpty>Tidak ditemukan</ComboboxEmpty>
                    {filteredGtkList.map((gtk) => (
                      <ComboboxItem key={gtk.id} value={gtk.id}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={gtk.foto} alt={gtk.namaLengkap} />
                            <AvatarFallback>{gtk.namaLengkap.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{gtk.namaLengkap}</p>
                            <p className="text-xs text-muted-foreground">{gtk.sekolah} • {gtk.nuptk}</p>
                          </div>
                        </div>
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenis">Jenis Talenta</Label>
              <Select value={formJenis} onValueChange={(v) => v && setFormJenis(v)}>
                <SelectTrigger>
                  <SelectValue>
                    {formJenis === "peserta_pelatihan" ? "Peserta Pelatihan/Workshop/Seminar/Upskilling" :
                      formJenis === "pembimbing_lomba" ? "Pembimbing Lomba" :
                        formJenis === "peserta_lomba" ? "Peserta Lomba" :
                          formJenis === "minat_bakat" ? "Minat/Bakat" : "Pilih Jenis Talenta"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peserta_pelatihan">Peserta Pelatihan/Workshop/Seminar/Upskilling</SelectItem>
                  <SelectItem value="pembimbing_lomba">Pembimbing Lomba</SelectItem>
                  <SelectItem value="peserta_lomba">Peserta Lomba</SelectItem>
                  <SelectItem value="minat_bakat">Minat/Bakat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Fields based on Jenis */}
            {formJenis === "peserta_pelatihan" && (
              <>
                <div className="space-y-2">
                  <Label>Nama Kegiatan</Label>
                  <Input placeholder="Nama kegiatan pelatihan" />
                </div>
                <div className="space-y-2">
                  <Label>Penyelenggara Kegiatan</Label>
                  <Input placeholder="Nama penyelenggara" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal Mulai</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Jangka Waktu (Hari)</Label>
                    <Input type="number" placeholder="Jumlah hari" />
                  </div>
                </div>
              </>
            )}

            {(formJenis === "pembimbing_lomba" || formJenis === "peserta_lomba") && (
              <>
                <div className="space-y-2">
                  <Label>Nama Lomba</Label>
                  <Input placeholder="Nama lomba" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jenjang</Label>
                    <Select value={formJenjang} onValueChange={(v) => v && setFormJenjang(v)}>
                      <SelectTrigger>
                        <SelectValue>{formJenjang ? jenjangOptions.find(j => j.toLowerCase() === formJenjang) : "Pilih jenjang"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {jenjangOptions.map((j) => (
                          <SelectItem key={j} value={j.toLowerCase()}>{j}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bidang</Label>
                    <Select value={formBidang} onValueChange={(v) => v && setFormBidang(v)}>
                      <SelectTrigger>
                        <SelectValue>{formBidang ? bidangOptions.find(b => b.toLowerCase() === formBidang) : "Pilih bidang"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {bidangOptions.map((b) => (
                          <SelectItem key={b} value={b.toLowerCase()}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Penyelenggara Kegiatan</Label>
                  <Input placeholder="Nama penyelenggara" />
                </div>
                <div className="space-y-2">
                  <Label>Prestasi</Label>
                  <Input placeholder="Contoh: Juara 1, Finalis, dll" />
                </div>
                <div className="space-y-2">
                  <Label>Upload Bukti/Sertifikat</Label>
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                </div>
              </>
            )}

            {formJenis === "minat_bakat" && (
              <div className="space-y-2">
                <Label>Deskripsi Minat/Bakat</Label>
                <Textarea placeholder="Jelaskan minat dan bakat yang dimiliki..." rows={4} />
              </div>
            )}
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={() => { setIsModalOpen(false); setFormJenis(""); setFormGtk(""); setFormJenjang(""); setFormBidang(""); setGtkSearch(""); }}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
