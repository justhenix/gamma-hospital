# Gamma Hospital Pharmacy

Gamma Hospital Pharmacy membantu petugas farmasi memantau antrean resep, menyiapkan obat, mencetak etiket, dan memberi tahu pasien saat obat siap diambil.

**Buka aplikasi:** [gamma-hospital.vercel.app](https://gamma-hospital.vercel.app)

> Aplikasi yang dipublikasikan saat ini adalah demo operasional. Nama pasien, nomor rekam medis, resep, dan nomor antrean di dalamnya merupakan data sintetis untuk pengujian—bukan data pasien sebenarnya.

## Panduan petugas farmasi

### 1. Pantau antrean resep

Buka halaman utama untuk melihat seluruh resep. Gunakan tab status untuk menyaring antrean:

- **Menunggu** — resep baru yang belum diverifikasi.
- **Terverifikasi** — resep sudah diperiksa dan siap disiapkan.
- **Sedang Disiapkan** — obat sedang diracik atau dikemas.
- **Siap Diambil** — obat dapat diserahkan kepada pasien.
- **Butuh Klarifikasi** — ada informasi yang perlu dikonfirmasi kepada dokter.
- **Selesai** — obat sudah diserahkan.

Untuk bekerja lebih cepat, gunakan `J` atau `↓` untuk turun, `K` atau `↑` untuk naik, lalu `Enter` untuk membuka resep yang dipilih.

### 2. Proses resep

Buka salah satu resep untuk melihat data pasien, dokter, daftar obat, aturan pakai, dan riwayat perubahan. Ikuti tombol tindakan utama sesuai urutan kerja:

`Menunggu → Terverifikasi → Sedang Disiapkan → Siap Diambil → Selesai`

Gunakan **Butuh Klarifikasi** ketika dosis, obat, atau instruksi dokter belum jelas. Setiap perubahan status dicatat dalam riwayat resep.

### 3. Cetak etiket obat

Dari detail resep, buka etiket lalu cetak pada kertas termal 100 × 60 mm. Periksa kembali nama pasien, obat, dosis, dan aturan pakai sebelum mencetak atau menyerahkan obat.

### 4. Tampilkan antrean di ruang tunggu

Buka [Layar Antrean](https://gamma-hospital.vercel.app/display) pada TV atau monitor ruang tunggu. Halaman ini memperbarui antrean secara otomatis dan menonjolkan nomor yang sudah siap dipanggil.

## Panduan pasien

Pasien dapat memantau status obat melalui alamat yang diberikan petugas:

`https://gamma-hospital.vercel.app/track/KODE-ANTREAN`

Sebagai contoh demo, buka [antrean A-002](https://gamma-hospital.vercel.app/track/A-002). Nama pasien ditampilkan dalam bentuk tersamarkan untuk menjaga privasi.

## Catatan penggunaan

- Sistem ini mendukung alur kerja farmasi dan tidak menggantikan pemeriksaan klinis apoteker.
- Jangan memasukkan data pasien sebenarnya ke deployment demo publik.
- Pastikan etiket dan obat diperiksa ulang sebelum diserahkan.
- Jika halaman tidak memperbarui status, muat ulang halaman dan hubungi pengelola aplikasi bila masalah berlanjut.

## Informasi singkat untuk pengelola

Aplikasi menggunakan Next.js, TypeScript, Drizzle ORM, dan Turso/libSQL. Untuk menjalankannya secara lokal:

```bash
npm install
copy .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Gunakan `cp .env.example .env` pada macOS atau Linux. Jalankan seluruh pemeriksaan sebelum mengirim perubahan:

```bash
npm run check
```

GitHub Actions menjalankan tes, lint, typecheck, dan build untuk setiap pull request serta push ke `main`. Vercel membuat preview untuk branch lain dan menerbitkan `main` ke alamat produksi secara otomatis. Deployment menerima `DATABASE_URL`/`DATABASE_AUTH_TOKEN` atau variabel `TURSO_*` dari Vercel Marketplace; jangan pernah menyimpan nilainya di Git.
