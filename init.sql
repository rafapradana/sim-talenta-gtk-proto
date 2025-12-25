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
    status status_sekolah NOT NULL,
    alamat TEXT NOT NULL,
    kepala_sekolah_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- GTK table
CREATE TABLE gtk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    nama_lengkap VARCHAR(255) NOT NULL,
    nuptk VARCHAR(20) UNIQUE,
    nip VARCHAR(30) UNIQUE,
    kelamin kelamin NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis jenis_gtk NOT NULL,
    jabatan VARCHAR(255),
    sekolah_id UUID REFERENCES sekolah(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add foreign key for kepala_sekolah after gtk table exists
ALTER TABLE sekolah ADD CONSTRAINT fk_kepala_sekolah FOREIGN KEY (kepala_sekolah_id) REFERENCES gtk(id);

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
    'admin@simtalenta.go.id',
    '$2b$12$N6WVZtIqQyP7ufT1zapWBO0XsQOeYEOJlaJbpZdWAiERsuVr9iafK',
    'super_admin',
    true
);

-- Sample Sekolah
INSERT INTO sekolah (id, nama, npsn, status, alamat)
VALUES 
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'SMAN 1 Malang', '20536421', 'negeri', 'Jl. Tugu No. 1, Malang'),
    ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'SMKN 4 Malang', '20536422', 'negeri', 'Jl. Tanimbar No. 22, Malang');

-- Sample GTK User (password: admin123)
-- Algorithm: bcrypt ($2b$), Cost: 12 rounds
INSERT INTO users (id, email, password, role, is_active)
VALUES (
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'guru1@simtalenta.go.id',
    '$2b$12$N6WVZtIqQyP7ufT1zapWBO0XsQOeYEOJlaJbpZdWAiERsuVr9iafK',
    'gtk',
    true
);

-- Sample GTK
INSERT INTO gtk (id, user_id, nama_lengkap, nuptk, nip, kelamin, tanggal_lahir, jenis, jabatan, sekolah_id)
VALUES (
    'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'Budi Santoso, S.Pd',
    '1234567890123456',
    '198501012010011001',
    'L',
    '1985-01-01',
    'guru',
    'Guru Matematika',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'
);

-- Sample Talenta - Peserta Pelatihan
INSERT INTO talenta (gtk_id, jenis, nama_kegiatan, penyelenggara_kegiatan, tanggal_mulai, jangka_waktu)
VALUES (
    'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'peserta_pelatihan',
    'Pelatihan Kurikulum Merdeka',
    'Kemendikbud',
    '2024-06-01',
    5
);

-- Sample Talenta - Pembimbing Lomba
INSERT INTO talenta (gtk_id, jenis, nama_lomba, jenjang, penyelenggara_kegiatan, bidang, prestasi)
VALUES (
    'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'pembimbing_lomba',
    'Olimpiade Matematika Nasional',
    'nasional',
    'Kemendikbud',
    'akademik',
    'Juara 2'
);

-- =============================================
-- DONE
-- =============================================
