import { z } from "zod";

// Auth validations
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

// User validations
export const createUserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["super_admin", "admin_sekolah", "gtk"]),
});

export const updateUserSchema = z.object({
  email: z.string().email("Email tidak valid").optional(),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  role: z.enum(["super_admin", "admin_sekolah", "gtk"]).optional(),
  isActive: z.boolean().optional(),
});

// Sekolah validations
export const createSekolahSchema = z.object({
  nama: z.string().min(1, "Nama sekolah wajib diisi"),
  npsn: z.string().min(1, "NPSN wajib diisi"),
  jenjang: z.enum(["SMA", "SMK", "SLB"]),
  status: z.enum(["negeri", "swasta"]),
  kota: z.enum(["kota_malang", "kota_batu"]),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  kepalaSekolah: z.string().optional().nullable(),
});

export const updateSekolahSchema = createSekolahSchema.partial();

// GTK validations
export const createGtkSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  nuptk: z.string().optional().nullable(),
  nip: z.string().optional().nullable(),
  kelamin: z.enum(["L", "P"]),
  tanggalLahir: z.string(),
  jenis: z.enum(["guru", "tendik", "kepala_sekolah"]),
  jabatan: z.string().optional().nullable(),
  sekolahId: z.string().uuid().optional().nullable(),
});

export const updateGtkSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi").optional(),
  nuptk: z.string().optional().nullable(),
  nip: z.string().optional().nullable(),
  kelamin: z.enum(["L", "P"]).optional(),
  tanggalLahir: z.string().optional(),
  jenis: z.enum(["guru", "tendik", "kepala_sekolah"]).optional(),
  jabatan: z.string().optional().nullable(),
  sekolahId: z.string().uuid().optional().nullable(),
});

// Talenta validations
export const createTalentaSchema = z.object({
  gtkId: z.string().uuid(),
  jenis: z.enum(["peserta_pelatihan", "pembimbing_lomba", "peserta_lomba", "minat_bakat"]),
  // Peserta Pelatihan
  namaKegiatan: z.string().optional().nullable(),
  penyelenggaraKegiatan: z.string().optional().nullable(),
  tanggalMulai: z.string().optional().nullable(),
  jangkaWaktu: z.number().optional().nullable(),
  // Lomba
  namaLomba: z.string().optional().nullable(),
  jenjang: z.enum(["kota", "provinsi", "nasional", "internasional"]).optional().nullable(),
  bidang: z.enum(["akademik", "inovasi", "teknologi", "sosial", "seni", "kepemimpinan"]).optional().nullable(),
  prestasi: z.string().optional().nullable(),
  buktiUrl: z.string().optional().nullable(),
  // Minat/Bakat
  deskripsi: z.string().optional().nullable(),
});

export const updateTalentaSchema = createTalentaSchema.partial().omit({ gtkId: true });

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateSekolahInput = z.infer<typeof createSekolahSchema>;
export type UpdateSekolahInput = z.infer<typeof updateSekolahSchema>;
export type CreateGtkInput = z.infer<typeof createGtkSchema>;
export type UpdateGtkInput = z.infer<typeof updateGtkSchema>;
export type CreateTalentaInput = z.infer<typeof createTalentaSchema>;
export type UpdateTalentaInput = z.infer<typeof updateTalentaSchema>;
