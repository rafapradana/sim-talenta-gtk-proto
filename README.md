# SIPODI (Sistem Informasi Potensi Diri)

Sistem Informasi Potensi Diri GTK - Cabang Dinas Pendidikan Wilayah Malang

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: JWT (Access Token & Refresh Token)
- **File Storage**: MinIO (optional) / Local Storage

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- MinIO (optional, untuk file storage)

## Setup

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` ke `.env` dan sesuaikan:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/sim_talenta_gtk
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

### 3. Setup Database

```bash
# Generate migration
npm run db:generate

# Push schema ke database
npm run db:push

# Seed data awal
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Default Login

Setelah menjalankan seed:

- **Email**: admin@simtalenta.go.id
- **Password**: admin123

## Fitur

### Super Admin (Cabdin)
- ✅ Dashboard analitik
- ✅ Manajemen Sekolah (CRUD)
- ✅ Manajemen GTK (CRUD)
- ✅ Manajemen Talenta (CRUD + Verifikasi)
- ✅ Manajemen Users (CRUD)
- ✅ Export laporan (CSV)

### Admin Sekolah
- ✅ Dashboard sekolah
- ✅ Manajemen GTK di sekolahnya
- ✅ Verifikasi talenta GTK
- ✅ Export laporan sekolah

### User GTK
- ✅ Kelola data diri
- ✅ Input talenta (Peserta Pelatihan, Pembimbing Lomba, Peserta Lomba, Minat/Bakat)
- ✅ Upload bukti/sertifikat

## Struktur Database

### Users
- id, email, password, role, isActive

### Sekolah
- id, nama, npsn, status, alamat, kepalaSekolahId

### GTK
- id, userId, namaLengkap, nuptk, nip, kelamin, tanggalLahir, jenis, jabatan, sekolahId

### Talenta
- id, gtkId, jenis
- Peserta Pelatihan: namaKegiatan, penyelenggaraKegiatan, tanggalMulai, jangkaWaktu
- Lomba: namaLomba, jenjang, bidang, prestasi, buktiUrl
- Minat/Bakat: deskripsi
- isVerified, verifiedBy, verifiedAt

## Scripts

```bash
npm run dev          # Development server
npm run build        # Build production
npm run start        # Start production server
npm run db:generate  # Generate Drizzle migration
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed initial data
```

## License

MIT
