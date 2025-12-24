import "dotenv/config";
import { db, users, sekolah, gtk, talenta } from "./index";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create super admin
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const [superAdmin] = await db
    .insert(users)
    .values({
      email: "admin@simtalenta.go.id",
      password: hashedPassword,
      role: "super_admin",
    })
    .returning();

  console.log("✅ Super admin created:", superAdmin.email);

  // Create sample sekolah
  const [sekolah1] = await db
    .insert(sekolah)
    .values({
      nama: "SMAN 1 Malang",
      npsn: "20536421",
      status: "negeri",
      alamat: "Jl. Tugu No. 1, Malang",
    })
    .returning();

  const [sekolah2] = await db
    .insert(sekolah)
    .values({
      nama: "SMKN 4 Malang",
      npsn: "20536422",
      status: "negeri",
      alamat: "Jl. Tanimbar No. 22, Malang",
    })
    .returning();

  console.log("✅ Sample sekolah created");

  // Create sample GTK
  const [gtkUser1] = await db
    .insert(users)
    .values({
      email: "guru1@simtalenta.go.id",
      password: hashedPassword,
      role: "gtk",
    })
    .returning();

  const [gtk1] = await db
    .insert(gtk)
    .values({
      userId: gtkUser1.id,
      namaLengkap: "Budi Santoso, S.Pd",
      nuptk: "1234567890123456",
      nip: "198501012010011001",
      kelamin: "L",
      tanggalLahir: "1985-01-01",
      jenis: "guru",
      jabatan: "Guru Matematika",
      sekolahId: sekolah1.id,
    })
    .returning();

  // Create sample talenta
  await db.insert(talenta).values({
    gtkId: gtk1.id,
    jenis: "peserta_pelatihan",
    namaKegiatan: "Pelatihan Kurikulum Merdeka",
    penyelenggaraKegiatan: "Kemendikbud",
    tanggalMulai: "2024-06-01",
    jangkaWaktu: 5,
  });

  await db.insert(talenta).values({
    gtkId: gtk1.id,
    jenis: "pembimbing_lomba",
    namaLomba: "Olimpiade Matematika Nasional",
    jenjang: "nasional",
    penyelenggaraKegiatan: "Kemendikbud",
    bidang: "akademik",
    prestasi: "Juara 2",
  });

  console.log("✅ Sample GTK and talenta created");

  console.log("\n🎉 Seeding completed!");
  console.log("\n📝 Login credentials:");
  console.log("   Email: admin@simtalenta.go.id");
  console.log("   Password: admin123");

  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
