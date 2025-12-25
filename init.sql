-- =============================================
-- SIPODI - Database Initialization
-- =============================================

-- Drop existing tables and types (for clean install)
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS talenta CASCADE;
DROP TABLE IF EXISTS gtk CASCADE;
DROP TABLE IF EXISTS sekolah CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS jenis_gtk CASCADE;
DROP TYPE IF EXISTS kelamin CASCADE;
DROP TYPE IF EXISTS status_sekolah CASCADE;
DROP TYPE IF EXISTS kota CASCADE;
DROP TYPE IF EXISTS jenjang_sekolah CASCADE;
DROP TYPE IF EXISTS jenis_talenta CASCADE;
DROP TYPE IF EXISTS jenjang_lomba CASCADE;
DROP TYPE IF EXISTS bidang_lomba CASCADE;

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('super_admin', 'admin_sekolah', 'gtk');
CREATE TYPE jenis_gtk AS ENUM ('guru', 'tendik', 'kepala_sekolah');
CREATE TYPE kelamin AS ENUM ('L', 'P');
CREATE TYPE status_sekolah AS ENUM ('negeri', 'swasta');
CREATE TYPE kota AS ENUM ('kota_malang', 'kota_batu');
CREATE TYPE jenjang_sekolah AS ENUM ('SMA', 'SMK', 'SLB');
CREATE TYPE jenis_talenta AS ENUM ('peserta_pelatihan', 'pembimbing_lomba', 'peserta_lomba', 'minat_bakat');
CREATE TYPE jenjang_lomba AS ENUM ('kota', 'provinsi', 'nasional', 'internasional');
CREATE TYPE bidang_lomba AS ENUM ('akademik', 'inovasi', 'teknologi', 'sosial', 'seni', 'kepemimpinan');

-- =============================================
-- TABLES
-- =============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'gtk',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sekolah table
CREATE TABLE sekolah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(255) NOT NULL,
    npsn VARCHAR(20) NOT NULL UNIQUE,
    jenjang jenjang_sekolah NOT NULL,
    status status_sekolah NOT NULL,
    kota kota NOT NULL,
    alamat TEXT NOT NULL,
    kepala_sekolah VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- GTK table
CREATE TABLE gtk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    nama_lengkap VARCHAR(255) NOT NULL,
    nuptk VARCHAR(30),
    nip VARCHAR(30),
    kelamin kelamin NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis jenis_gtk NOT NULL,
    jabatan VARCHAR(255),
    sekolah_id UUID REFERENCES sekolah(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Talenta table
CREATE TABLE talenta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gtk_id UUID NOT NULL REFERENCES gtk(id),
    jenis jenis_talenta NOT NULL,
    -- Peserta Pelatihan fields
    nama_kegiatan VARCHAR(255),
    penyelenggara_kegiatan VARCHAR(255),
    tanggal_mulai DATE,
    jangka_waktu INTEGER,
    -- Pembimbing/Peserta Lomba fields
    nama_lomba VARCHAR(255),
    jenjang jenjang_lomba,
    bidang bidang_lomba,
    prestasi VARCHAR(255),
    bukti_url TEXT,
    -- Minat/Bakat fields
    deskripsi TEXT,
    -- Verification
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sekolah_jenjang ON sekolah(jenjang);
CREATE INDEX idx_sekolah_kota ON sekolah(kota);
CREATE INDEX idx_sekolah_status ON sekolah(status);
CREATE INDEX idx_gtk_user_id ON gtk(user_id);
CREATE INDEX idx_gtk_sekolah_id ON gtk(sekolah_id);
CREATE INDEX idx_talenta_gtk_id ON talenta(gtk_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- =============================================
-- SEED DATA
-- =============================================

-- Super Admin (password: admin123)
-- Algorithm: bcrypt ($2b$), Cost: 12 rounds
INSERT INTO users (id, email, password, role, is_active)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@sipodi.go.id',
    '$2b$12$N6WVZtIqQyP7ufT1zapWBO0XsQOeYEOJlaJbpZdWAiERsuVr9iafK',
    'super_admin',
    true
);

-- Sample Sekolah
INSERT INTO sekolah (id, nama, npsn, jenjang, status, kota, alamat, kepala_sekolah)
VALUES 
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'SMAN 1 Malang', '20536421', 'SMA', 'negeri', 'kota_malang', 'Jl. Tugu No. 1, Malang', 'Dr. Budi Santoso, M.Pd'),
    ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'SMKN 4 Malang', '20536422', 'SMK', 'negeri', 'kota_malang', 'Jl. Tanimbar No. 22, Malang', 'Drs. Ahmad Yani, M.M');

-- =============================================
-- DONE
-- =============================================
