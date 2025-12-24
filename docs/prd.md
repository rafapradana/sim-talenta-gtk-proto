# 📘 PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Sistem Informasi Manajemen Talenta GTK

**Cabang Dinas Pendidikan Wilayah Malang**

---

## 1. Ringkasan Produk (Product Overview)

### Nama Produk

**SIM-TALENTA GTK**

### Deskripsi Singkat

SIM-TALENTA GTK adalah sistem informasi terintegrasi untuk mengelola data Guru dan Tenaga Kependidikan (GTK) berbasis **potensi, kompetensi, prestasi, dan kinerja**, guna mendukung **pengambilan keputusan strategis** di lingkungan Cabang Dinas Pendidikan Wilayah Malang.

### Masalah yang Diselesaikan

* Data GTK tersebar dan tidak sinkron
* Potensi dan kompetensi GTK tidak terdokumentasi dengan baik
* Proses perencanaan, pembinaan, dan pengembangan GTK berbasis manual
* Tidak adanya dashboard analitik untuk pengambilan keputusan

### Tujuan Utama

* Membangun **database GTK terintegrasi**
* Memetakan potensi dan talenta GTK secara sistematis
* Menyediakan **dashboard analitik wilayah & sekolah**
* Mendukung kebijakan pengembangan GTK berbasis data

---

## 2. Target Pengguna (User & Stakeholder)

### 2.1 User Roles

#### 1️⃣ Super Admin (Cabdin)

* Mengelola seluruh data seluruh user (admin sekolah dan GTK) dan sekolah

#### 2️⃣ Admin Sekolah

* Mengelola data GTK di sekolahnya
* Verifikasi data talenta GTK
* Melihat laporan sekolah
#### 3️⃣ User GTK

* Mengisi dan memperbarui data diri
* Mengisi talenta
* Mengunggah dokumen pendukung

---

## 3. Ruang Lingkup Produk (Product Scope)

### In Scope (WAJIB ADA – MVP+)

* Manajemen Data GTK
* Manajemen Talenta
* Database Sekolah
* Dashboard Analitik
* Role-based Access Control
* Export laporan (PDF/Excel)

### Out of Scope (Fase Lanjut)

* Integrasi nasional (DAPODIK pusat)
* AI rekomendasi (fase 2)
* Mobile app native

---

#### Hak Akses

* Super Admin: CRUD semua data
* Admin Sekolah: CRUD data GTK sekolahnya
* User GTK: Kelola data diri dan talentanya sendiri

---

## 4. Fitur & Kebutuhan Fungsional (Functional Requirements)

---

### Data GTK yang Dikelola:

* Nama Lengkap
* NUPTK
* NIP
* Kelamin (L/P)
* Tanggal Lahir
* Jenis (Guru, Tendik, Kepala Sekolah)
* Jabatan (Text)
* Talenta (conditional form tergantung jenis yang dipilih ketika input, jenis jenisnya yakni: Peserta Pelatihan, Pembimbing Lomba, Peserta Lomba, Minat/Bakat)
  * jika yang dipilih Peserta Pelatihan maka fieldnya:
    * Nama Kegiaan (text)
    * Penyelenggara Kegiatan (text)
    * Tanggal Mulai Kegiatan (Date)
    * Jangka Wakttu (Hari)
  * jika yang dipilih adalah pembimbing lomba maka fieldnya:
    * Nama Lomba (text)
    * Jenjang: Kota, Provinsi, Nasional, Internasional
    * Penyelenggara Kegiatan (text)
    * Bidang:
      * Akademik
      * Inovasi
      * Teknologi
      * Sosial
      * Seni
      * Kepemimpinan
    * Prestasi: text
    * Upload Bukti / Surat Keterangan / Sertifikat
* sekolahnya gtk tersebut

---

### Data Sekolah yang dikelola:

* Nama Sekolah
* NPSN
* status sekolah (negeri/swasta)
* alamat
* kepala sekolah (user dengan jenis kepala sekolah)
* gtk/user yang ada di sekolah tersebut

---

## Kebutuhan Non-Fungsional (Non-Functional Requirements)

### Keamanan

* Authentication & authorization (JWT (Access Token & Refresh Token))
* Enkripsi password

### Performa

* Support ≥ 10.000 user aktif
* Tahan 5000 RPS
* Response time < 3 detik
* Pagination & lazy loading

### Usability

* UI sederhana & mobile-friendly
* Bahasa Indonesia
* Form validation jelas

### Reliability

* Uptime target: 99%
* Auto backup & recovery

---

## Risiko & Mitigasi

| Risiko               | Mitigasi                |
| -------------------- | ----------------------- |
| GTK malas isi data   | Wajib + monitoring      |
| Data tidak valid     | Verifikasi admin        |
| Resistensi perubahan | Sosialisasi & pelatihan |
| Overload sistem      | Scaling bertahap        |

---