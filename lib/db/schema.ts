import { pgTable, text, timestamp, uuid, varchar, date, integer, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["super_admin", "admin_sekolah", "gtk"]);
export const jenisGtkEnum = pgEnum("jenis_gtk", ["guru", "tendik", "kepala_sekolah"]);
export const kelaminEnum = pgEnum("kelamin", ["L", "P"]);
export const statusSekolahEnum = pgEnum("status_sekolah", ["negeri", "swasta"]);
export const kotaEnum = pgEnum("kota", ["kota_malang", "kota_batu"]);
export const jenjangSekolahEnum = pgEnum("jenjang_sekolah", ["SMA", "SMK", "SLB"]);
export const jenisTalentaEnum = pgEnum("jenis_talenta", ["peserta_pelatihan", "pembimbing_lomba", "peserta_lomba", "minat_bakat"]);
export const jenjangLombaEnum = pgEnum("jenjang_lomba", ["kota", "provinsi", "nasional", "internasional"]);
export const bidangLombaEnum = pgEnum("bidang_lomba", ["akademik", "inovasi", "teknologi", "sosial", "seni", "kepemimpinan"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("gtk"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sekolah table
export const sekolah = pgTable("sekolah", {
  id: uuid("id").defaultRandom().primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  npsn: varchar("npsn", { length: 20 }).notNull().unique(),
  jenjang: jenjangSekolahEnum("jenjang").notNull(),
  status: statusSekolahEnum("status").notNull(),
  kota: kotaEnum("kota").notNull(),
  alamat: text("alamat").notNull(),
  kepalaSekolah: varchar("kepala_sekolah", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// GTK table
export const gtk = pgTable("gtk", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  namaLengkap: varchar("nama_lengkap", { length: 255 }).notNull(),
  nuptk: varchar("nuptk", { length: 30 }),
  nip: varchar("nip", { length: 30 }),
  kelamin: kelaminEnum("kelamin").notNull(),
  tanggalLahir: date("tanggal_lahir").notNull(),
  jenis: jenisGtkEnum("jenis").notNull(),
  jabatan: varchar("jabatan", { length: 255 }),
  sekolahId: uuid("sekolah_id").references(() => sekolah.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Talenta table
export const talenta = pgTable("talenta", {
  id: uuid("id").defaultRandom().primaryKey(),
  gtkId: uuid("gtk_id").references(() => gtk.id).notNull(),
  jenis: jenisTalentaEnum("jenis").notNull(),
  // Peserta Pelatihan fields
  namaKegiatan: varchar("nama_kegiatan", { length: 255 }),
  penyelenggaraKegiatan: varchar("penyelenggara_kegiatan", { length: 255 }),
  tanggalMulai: date("tanggal_mulai"),
  jangkaWaktu: integer("jangka_waktu"), // dalam hari
  // Pembimbing/Peserta Lomba fields
  namaLomba: varchar("nama_lomba", { length: 255 }),
  jenjang: jenjangLombaEnum("jenjang"),
  bidang: bidangLombaEnum("bidang"),
  prestasi: varchar("prestasi", { length: 255 }),
  buktiUrl: text("bukti_url"),
  // Minat/Bakat fields
  deskripsi: text("deskripsi"),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedBy: uuid("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Refresh tokens table
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  gtk: one(gtk, { fields: [users.id], references: [gtk.userId] }),
  refreshTokens: many(refreshTokens),
}));

export const sekolahRelations = relations(sekolah, ({ many }) => ({
  gtkList: many(gtk),
}));

export const gtkRelations = relations(gtk, ({ one, many }) => ({
  user: one(users, { fields: [gtk.userId], references: [users.id] }),
  sekolah: one(sekolah, { fields: [gtk.sekolahId], references: [sekolah.id] }),
  talentaList: many(talenta),
}));

export const talentaRelations = relations(talenta, ({ one }) => ({
  gtk: one(gtk, { fields: [talenta.gtkId], references: [gtk.id] }),
  verifier: one(users, { fields: [talenta.verifiedBy], references: [users.id] }),
}));
