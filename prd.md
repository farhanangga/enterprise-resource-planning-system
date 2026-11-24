# PRD: ETERA ERP

**Versi:** 1.0 (Draft) | **Tanggal:** 21 November 2026 | **Status:** Untuk review

---

## 1. Ringkasan Produk

**ETERA** adalah aplikasi ERP (Enterprise Resource Planning) berbasis web untuk UKM dan bisnis menengah di Indonesia. ETERA menyatukan operasional inti (penjualan, pembelian, stok, keuangan, dan SDM) dalam satu platform yang ringan, modern, dan mudah dipakai.

**Tagline:** *Satu sistem, seluruh bisnis.*

### 1.1 Latar Belakang dan Masalah

- UKM masih mengelola bisnis dengan spreadsheet, nota manual, dan beberapa aplikasi terpisah, sehingga data tidak sinkron.
- ERP yang ada cenderung mahal, rumit, dan butuh implementasi lama.
- Pemilik bisnis kesulitan melihat kondisi bisnis secara real-time (stok, omzet, piutang, utang).

### 1.2 Tujuan Produk

1. Menyediakan satu sumber data untuk operasional bisnis.
2. Onboarding cepat: dari daftar sampai dashboard aktif kurang dari 5 menit.
3. Antarmuka bersih dan personal (tema terang/gelap/sistem).
4. Fondasi multi-tenant yang aman dan siap berkembang modul demi modul.

### 1.3 Target Pengguna (Persona)

| Persona | Peran | Kebutuhan Utama |
| --- | --- | --- |
| Rina, Pemilik Toko | Owner | Melihat omzet, stok, dan profit harian di satu layar |
| Budi, Manajer Operasional | Admin | Mengatur pengguna, produk, dan alur pesanan |
| Sari, Staf Gudang/Kasir | Staff | Input transaksi dan cek stok dengan cepat |
| Dedi, Akuntan | Finance | Rekap invoice, pembayaran, dan laporan keuangan |

### 1.4 Metrik Keberhasilan

| Metrik | Target (3 bulan setelah rilis) |
| --- | --- |
| Waktu signup sampai dashboard | < 3 menit |
| Konversi landing page ke signup | >= 4% |
| Pengguna aktif mingguan (WAU) per tenant | >= 60% dari akun terdaftar |
| Waktu muat dashboard (p95) | < 2 detik |
| Uptime | >= 99,5% |

---

## 2. Ruang Lingkup

### 2.1 Dalam Lingkup MVP (Rilis 1)

- Halaman: **Landing Page, Sign In, Sign Up, Dashboard, Settings (ganti tema)**.
- Autentikasi dan manajemen sesi.
- Multi-tenant (organisasi) dan Role-Based Access Control (RBAC) dasar.
- Dashboard dengan KPI ringkas dan navigasi modul.
- Preferensi pengguna: tema Terang, Gelap, dan Ikuti Sistem.

### 2.2 Di Luar Lingkup MVP (Roadmap)

Modul penuh Inventory, Sales, Purchasing, Finance, dan HR dikerjakan bertahap pada Fase 2 dan 3 (lihat bagian 9). Skema database dan ERD sudah dirancang mencakup modul tersebut agar tidak perlu migrasi besar nanti.

---

## 3. Daftar Fitur

### 3.1 Fitur MVP (Prioritas P0)

| ID | Fitur | Deskripsi | Prioritas |
| --- | --- | --- | --- |
| F-01 | Landing page | Halaman pemasaran: hero, fitur, harga, FAQ, CTA | P0 |
| F-02 | Sign up | Registrasi dengan email dan kata sandi, membuat organisasi pertama | P0 |
| F-03 | Sign in | Login email dan kata sandi, opsi "Ingat saya" | P0 |
| F-04 | Lupa dan reset kata sandi | Tautan reset via email (berlaku 1 jam) | P0 |
| F-05 | Verifikasi email | Tautan verifikasi setelah registrasi | P0 |
| F-06 | Manajemen sesi | Token akses + refresh token, logout, logout semua perangkat | P0 |
| F-07 | Multi-tenant | Data terisolasi per organisasi | P0 |
| F-08 | RBAC dasar | Role: Owner, Admin, Manager, Staff, Finance | P0 |
| F-09 | Dashboard | KPI cards, grafik tren, aktivitas terbaru, pintasan cepat | P0 |
| F-10 | Sidebar navigasi modul | Menu modul dengan status "Segera hadir" untuk modul belum aktif | P0 |
| F-11 | Settings: ganti tema | Terang, Gelap, Ikuti Sistem; tersimpan per pengguna | P0 |
| F-12 | Settings: profil | Ubah nama, avatar, bahasa, zona waktu | P1 |
| F-13 | Settings: keamanan | Ubah kata sandi, daftar sesi aktif | P1 |
| F-14 | Audit log dasar | Mencatat login, perubahan pengaturan, dan aksi penting | P1 |

### 3.2 Fitur Modul ERP (Roadmap)

| Modul | Fitur Utama | Fase |
| --- | --- | --- |
| Inventory | Produk, kategori, satuan, gudang, mutasi stok, stok opname, peringatan stok minimum | 2 |
| Sales | Pelanggan, penawaran, sales order, invoice, pembayaran, retur | 2 |
| Purchasing | Supplier, purchase order, penerimaan barang, tagihan supplier | 2 |
| Finance | Chart of accounts, jurnal umum, kas dan bank, laporan laba rugi dan neraca | 3 |
| HR | Karyawan, departemen, absensi, cuti, penggajian dasar | 3 |
| Laporan | Laporan penjualan, stok, piutang, utang, ekspor PDF dan Excel | 2-3 |
| Integrasi | Payment gateway, e-Faktur, marketplace, WhatsApp notifikasi | 3 |
| Notifikasi | Notifikasi in-app dan email | 2 |

---

## 4. Kebutuhan Per Halaman

### 4.1 Landing Page (`/`)

**Tujuan:** Memperkenalkan ETERA dan mengonversi pengunjung menjadi pengguna.

**Section:**

1. **Navbar:** logo ETERA, menu (Fitur, Harga, FAQ), tombol *Masuk* dan *Daftar Gratis*.
2. **Hero:** judul nilai utama, subjudul, CTA utama *Mulai Gratis*, CTA sekunder *Lihat Demo*, mockup dashboard.
3. **Logo/Social proof:** logo pelanggan atau angka (jumlah bisnis, transaksi).
4. **Fitur utama:** grid 6 kartu (Inventory, Sales, Purchasing, Finance, HR, Laporan).
5. **Cara kerja:** 3 langkah (Daftar, Atur bisnis, Mulai bertransaksi).
6. **Harga:** 3 paket (Starter, Business, Enterprise).
7. **Testimoni.**
8. **FAQ:** accordion.
9. **CTA penutup.**
10. **Footer:** tautan produk, perusahaan, legal (Syarat dan Privasi), sosial media.

**Kebutuhan non-fungsional:** responsif (mobile-first), skor Lighthouse >= 90, SEO meta tag dan Open Graph, mendukung tema terang dan gelap.

**Kriteria penerimaan:**

- Tombol *Daftar Gratis* mengarah ke `/signup`; *Masuk* ke `/signin`.
- Pengguna yang sudah login otomatis diarahkan ke `/dashboard` saat membuka `/`.

### 4.2 Sign Up (`/signup`)

**Field:** Nama lengkap, Email, Kata sandi, Konfirmasi kata sandi, Nama bisnis/organisasi, persetujuan Syarat dan Kebijakan Privasi.

**Aturan:**

- Email unik; format valid.
- Kata sandi minimal 8 karakter, mengandung huruf dan angka; indikator kekuatan kata sandi.
- Saat sukses: buat `user`, buat `organization`, tetapkan role **Owner**, kirim email verifikasi, arahkan ke `/dashboard` (atau halaman "Cek email" jika verifikasi wajib).

**State:** loading, error validasi per field, error email sudah terdaftar, sukses.

**Kriteria penerimaan:**

- Validasi dilakukan di klien dan server.
- Rate limit 5 percobaan per menit per IP.
- Tautan ke `/signin` tersedia.

### 4.3 Sign In (`/signin`)

**Field:** Email, Kata sandi, checkbox *Ingat saya*, tautan *Lupa kata sandi?*.

**Aturan:**

- Pesan error generik ("Email atau kata sandi salah") untuk mencegah enumerasi akun.
- Akun dikunci sementara 15 menit setelah 5 kali gagal berturut-turut.
- Sukses: arahkan ke halaman tujuan semula atau `/dashboard`.
- Opsional (P2): login dengan Google.

**Kriteria penerimaan:**

- Sesi tersimpan via cookie httpOnly dan secure.
- "Ingat saya" memperpanjang masa refresh token menjadi 30 hari (default 24 jam).

### 4.4 Dashboard (`/dashboard`)

**Tujuan:** Ringkasan kondisi bisnis dan titik awal navigasi.

**Layout:** Sidebar (kiri), Topbar (pencarian, notifikasi, menu profil), Konten utama.

**Komponen:**

| Komponen | Isi |
| --- | --- |
| Sapaan | "Selamat pagi, {nama}" dan nama organisasi |
| KPI cards (4) | Total Penjualan, Total Pembelian, Nilai Stok, Piutang Jatuh Tempo (tren vs periode lalu) |
| Filter periode | Hari ini, 7 hari, 30 hari, Bulan ini, Kustom |
| Grafik tren | Penjualan vs pembelian (line/bar) |
| Produk terlaris | Top 5 |
| Stok menipis | Daftar produk di bawah stok minimum |
| Aktivitas terbaru | 10 aktivitas terakhir dari audit log |
| Pintasan cepat | Buat invoice, Tambah produk, Tambah pelanggan, Buat PO |
| Empty state | Panduan onboarding jika data belum ada (checklist: lengkapi profil bisnis, tambah produk, undang tim) |

**Sidebar:** Dashboard, Inventory, Sales, Purchasing, Finance, HR, Laporan, Settings. Modul yang belum rilis ditampilkan dengan badge *Segera*.

**Kriteria penerimaan:**

- Data KPI dibatasi sesuai role (mis. Staff tidak melihat data keuangan).
- Skeleton loading saat data dimuat; waktu muat p95 < 2 detik.
- Sidebar dapat dilipat; pada mobile menjadi drawer.

### 4.5 Settings (`/settings`)

**Tab:** Tampilan, Profil, Keamanan, (Organisasi untuk Owner/Admin, fase berikutnya).

**Tab Tampilan (wajib MVP):**

| Elemen | Detail |
| --- | --- |
| Pilihan tema | 3 opsi kartu pratinjau: **Terang**, **Gelap**, **Ikuti Sistem** |
| Perilaku | Perubahan diterapkan langsung tanpa reload (live preview) |
| Persistensi | Disimpan di tabel `user_settings` dan di-cache di `localStorage` agar tidak berkedip (flash) saat muat |
| Default | Ikuti Sistem (`prefers-color-scheme`) |
| Opsional (P2) | Warna aksen, kepadatan tampilan (nyaman/padat), ukuran font |

**Kriteria penerimaan:**

- Tema berlaku di seluruh halaman (landing, auth, dashboard) dan konsisten setelah login ulang di perangkat lain.
- Tidak ada flash tema salah saat halaman dimuat (inline script menerapkan class tema sebelum render).
- Kontras warna memenuhi WCAG AA di kedua tema.

**Tab Profil (P1):** nama, avatar, bahasa (ID/EN), zona waktu, format tanggal.

**Tab Keamanan (P1):** ubah kata sandi, daftar sesi aktif dengan tombol cabut, logout semua perangkat.

---

## 5. Alur Pengguna Utama

1. **Pengunjung baru:** Landing page → Daftar Gratis → isi form Sign Up → verifikasi email → Dashboard (onboarding checklist).
2. **Pengguna kembali:** Landing/Sign In → Dashboard.
3. **Ganti tema:** Dashboard → menu profil → Settings → Tampilan → pilih tema → tersimpan otomatis.
4. **Lupa kata sandi:** Sign In → Lupa kata sandi → input email → email reset → set kata sandi baru → Sign In.

---

## 6. Peran dan Hak Akses (RBAC)

| Hak Akses | Owner | Admin | Manager | Finance | Staff |
| --- | --- | --- | --- | --- | --- |
| Lihat Dashboard | Ya | Ya | Ya | Ya | Ya (terbatas) |
| Lihat KPI keuangan | Ya | Ya | Ya | Ya | Tidak |
| Kelola pengguna dan role | Ya | Ya | Tidak | Tidak | Tidak |
| Kelola pengaturan organisasi | Ya | Ya | Tidak | Tidak | Tidak |
| Ubah tema dan profil sendiri | Ya | Ya | Ya | Ya | Ya |
| Hapus organisasi/tagihan | Ya | Tidak | Tidak | Tidak | Tidak |
|  |  |  |  |  |  |

Izin disimpan sebagai pasangan `modul:aksi` (contoh `sales:read`, `inventory:write`) pada tabel `permissions`.

---

## 7. Arsitektur dan Tech Stack (Rekomendasi)

| Lapisan | Pilihan |
| --- | --- |
| Frontend | Next.js (React) + TypeScript + Tailwind CSS + shadcn/ui; tema via `next-themes` |
| Backend | Next.js API/Route Handlers atau NestJS (Node.js) |
| Database | PostgreSQL 16 |
| ORM | Prisma atau Drizzle |
| Auth | Argon2id untuk hash, JWT akses (15 menit) + refresh token rotasi, cookie httpOnly |
| Cache/Queue | Redis (rate limit, job email) |
| Email | Resend/SendGrid/SMTP |
| Hosting | Vercel/VPS + Docker; Neon/Supabase/managed Postgres |
| Observability | Sentry, log terstruktur, health check |

**Multi-tenancy:** model *shared database, shared schema* dengan kolom `organization_id` pada setiap tabel bisnis, ditambah Row-Level Security (RLS) PostgreSQL sebagai lapisan pengaman tambahan.

---

## 8. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
| --- | --- |
| Keamanan | HTTPS wajib, hash Argon2id, proteksi CSRF dan XSS, rate limiting, validasi input, audit log, enkripsi data sensitif saat disimpan |
| Privasi | Kepatuhan UU PDP (Pelindungan Data Pribadi): persetujuan, hak hapus data, kebijakan privasi |
| Performa | LCP < 2,5 detik; API p95 < 500 ms; indeks pada kolom `organization_id` dan kolom pencarian |
| Ketersediaan | Target 99,5%, backup harian, retensi 30 hari |
| Aksesibilitas | WCAG 2.1 AA, navigasi keyboard, label ARIA |
| Responsif | Mobile, tablet, desktop (breakpoint 640/768/1024/1280 px) |
| Lokalisasi | Bahasa Indonesia (default) dan Inggris; mata uang IDR; zona waktu Asia/Jakarta |
| Skalabilitas | Stateless backend, siap horizontal scaling |

---

## 9. Roadmap

| Fase | Cakupan | Estimasi |
| --- | --- | --- |
| **Fase 1 (MVP)** | Landing, Sign In/Up, Dashboard, Settings (tema), auth, multi-tenant, RBAC dasar | 6-8 minggu |
| **Fase 2** | Inventory, Sales, Purchasing, laporan dasar, notifikasi, undang anggota tim | 10-12 minggu |
| **Fase 3** | Finance (akuntansi), HR, integrasi pembayaran dan e-Faktur, API publik | 12-16 minggu |

---

## 10. Risiko dan Asumsi

| Risiko | Mitigasi |
| --- | --- |
| Cakupan ERP terlalu luas | Rilis modul bertahap, MVP berfokus pada fondasi dan dashboard |
| Kebocoran data antar-tenant | `organization_id` wajib, RLS, tes otomatis isolasi tenant |
| Adopsi rendah karena kompleksitas | Onboarding checklist, template data awal, UI sederhana |
| Kepatuhan pajak Indonesia (PPN, e-Faktur) | Libatkan konsultan pajak sebelum Fase 3 |

**Asumsi:** pengguna awal adalah UKM berbahasa Indonesia; akses melalui browser modern; satu pengguna dapat tergabung di beberapa organisasi (disiapkan di skema, UI-nya menyusul).

---

## 11. Entity Relationship Diagram (ERD)

### 11.1 Diagram (Notasi Teks)

```
ORGANIZATIONS ──< ORGANIZATION_MEMBERS >── USERS
      │                    │                  │
      │                    └──> ROLES         ├──< SESSIONS
      │                          │            ├──< PASSWORD_RESET_TOKENS
      │                          └──< ROLE_PERMISSIONS >── PERMISSIONS
      │                                       ├──< EMAIL_VERIFICATION_TOKENS
      │                                       ├──1 USER_SETTINGS
      │                                       └──< AUDIT_LOGS
      │
      ├──< CATEGORIES ──< PRODUCTS >── UNITS
      │                      │
      ├──< WAREHOUSES ──< STOCK_LEVELS >──┘
      │         └──< STOCK_MOVEMENTS >── PRODUCTS
      │
      ├──< CUSTOMERS ──< SALES_ORDERS ──< SALES_ORDER_ITEMS >── PRODUCTS
      │                       └──< INVOICES ──< PAYMENTS
      │
      └──< SUPPLIERS ──< PURCHASE_ORDERS ──< PURCHASE_ORDER_ITEMS >── PRODUCTS
```

### 11.2 Relasi Antar Entitas

| Entitas A | Relasi | Entitas B | Keterangan |
| --- | --- | --- | --- |
| organizations | 1 : N | organization\_members | Satu organisasi punya banyak anggota |
| users | 1 : N | organization\_members | Satu user bisa tergabung di banyak organisasi |
| roles | 1 : N | organization\_members | Role ditetapkan per keanggotaan |
| roles | N : M | permissions | Lewat `role_permissions` |
| users | 1 : N | sessions | Banyak sesi per user |
| users | 1 : 1 | user\_settings | Tema dan preferensi |
| users | 1 : N | audit\_logs | Jejak aktivitas |
| organizations | 1 : N | categories, products, warehouses, customers, suppliers | Semua data bisnis milik organisasi |
| categories | 1 : N | products | Kategori produk |
| units | 1 : N | products | Satuan produk |
| products | N : M | warehouses | Lewat `stock_levels` |
| products | 1 : N | stock\_movements | Riwayat mutasi |
| customers | 1 : N | sales\_orders | Pesanan penjualan |
| sales\_orders | 1 : N | sales\_order\_items | Detail item |
| sales\_orders | 1 : N | invoices | Satu pesanan bisa ditagih bertahap |
| invoices | 1 : N | payments | Pembayaran bertahap |
| suppliers | 1 : N | purchase\_orders | Pesanan pembelian |
| purchase\_orders | 1 : N | purchase\_order\_items | Detail item |

---

## 12. Skema Database (PostgreSQL)

**Konvensi:** primary key `id UUID DEFAULT gen_random_uuid()`; kolom waktu `TIMESTAMPTZ`; `created_at` dan `updated_at` ada di semua tabel (tidak diulang di bawah); soft delete memakai `deleted_at`; uang `NUMERIC(18,2)`; semua tabel bisnis memiliki `organization_id` (FK ke `organizations.id`, di-index).

### 12.1 Fase 1: Identitas, Akses, dan Pengaturan (MVP)

**`users`**

| Kolom | Tipe | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK |  |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Disimpan lowercase |
| password\_hash | TEXT | NOT NULL | Argon2id |
| full\_name | VARCHAR(150) | NOT NULL |  |
| avatar\_url | TEXT |  |  |
| email\_verified\_at | TIMESTAMPTZ |  |  |
| failed\_login\_count | INT | DEFAULT 0 | Untuk penguncian |
| locked\_until | TIMESTAMPTZ |  |  |
| last\_login\_at | TIMESTAMPTZ |  |  |
| is\_active | BOOLEAN | DEFAULT true |  |
| deleted\_at | TIMESTAMPTZ |  |  |

**`organizations`**

| Kolom | Tipe | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK |  |
| name | VARCHAR(200) | NOT NULL | Nama bisnis |
| slug | VARCHAR(100) | UNIQUE, NOT NULL |  |
| logo\_url | TEXT |  |  |
| industry | VARCHAR(100) |  |  |
| currency | CHAR(3) | DEFAULT 'IDR' |  |
| timezone | VARCHAR(50) | DEFAULT 'Asia/Jakarta' |  |
| plan | VARCHAR(30) | DEFAULT 'starter' | starter / business / enterprise |
| owner\_id | UUID | FK users.id |  |
| deleted\_at | TIMESTAMPTZ |  |  |

**`roles`**

| Kolom | Tipe | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK |  |
| organization\_id | UUID | FK, NULL untuk role sistem |  |
| name | VARCHAR(50) | NOT NULL | owner, admin, manager, finance, staff |
| description | TEXT |  |  |
| is\_system | BOOLEAN | DEFAULT false | Role bawaan tidak bisa dihapus |

**`permissions`**

| Kolom | Tipe | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK |  |
| module | VARCHAR(50) | NOT NULL | dashboard, inventory, sales, ... |
| action | VARCHAR(30) | NOT NULL | read, create, update, delete, export |
|  |  | UNIQUE (module, action) |  |

**`role_permissions`**

| Kolom | Tipe | Constraint |
| --- | --- | --- |
| role\_id | UUID | FK roles.id, PK composite |
| permission\_id | UUID | FK permissions.id, PK composite |

**`organization_members`**

| Kolom | Tipe | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK |  |
| organization\_id | UUID | FK, NOT NULL |  |
| user\_id | UUID | FK, NOT NULL |  |
| role\_id | UUID | FK, NOT NULL |  |
| status | VARCHAR(20) | DEFAULT 'active' | invited / active / suspended |
| invited\_by | UUID | FK users.id |  |
| joined\_at | TIMESTAMPTZ |  |  |
|  |  | UNIQUE (organization\_id, user\_id) |  |

**`user_settings`**

| Kolom | Tipe | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK |  |
| user\_id | UUID | FK users.id, UNIQUE | Relasi 1:1 |
| theme | VARCHAR(10) | DEFAULT 'system', CHECK IN ('light','dark','system') | **Pengaturan ganti tema** |
| accent\_color | VARCHAR(20) |  | P2 |
| density | VARCHAR(10) | DEFAULT 'comfortable' | comfortable / compact (P2) |
| language | VARCHAR(5) | DEFAULT 'id' | id / en |
| timezone | VARCHAR(50) | DEFAULT 'Asia/Jakarta' |  |
| date\_format | VARCHAR(20) | DEFAULT 'DD/MM/YYYY' |  |
| sidebar\_collapsed | BOOLEAN | DEFAULT false |  |

**`sessions`**

| Kolom | Tipe | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK |  |
| user\_id | UUID | FK, NOT NULL |  |
| refresh\_token\_hash | TEXT | UNIQUE, NOT NULL | Disimpan sebagai hash |
| user\_agent | TEXT |  |  |
| ip\_address | INET |  |  |
| remember\_me | BOOLEAN | DEFAULT false |  |
| expires\_at | TIMESTAMPTZ | NOT NULL |  |
| revoked\_at | TIMESTAMPTZ |  |  |

**`email_verification_tokens`** dan **`password_reset_tokens`** (struktur sama)

| Kolom | Tipe | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK |  |
| user\_id | UUID | FK, NOT NULL |  |
| token\_hash | TEXT | UNIQUE, NOT NULL |  |
| expires\_at | TIMESTAMPTZ | NOT NULL | Verifikasi 24 jam, reset 1 jam |
| used\_at | TIMESTAMPTZ |  |  |

**`audit_logs`**

| Kolom | Tipe | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK |  |
| organization\_id | UUID | FK |  |
| user\_id | UUID | FK |  |
| action | VARCHAR(80) | NOT NULL | mis. `auth.login`, `settings.theme_changed` |
| entity\_type | VARCHAR(50) |  |  |
| entity\_id | UUID |  |  |
| metadata | JSONB |  | Nilai sebelum/sesudah |
| ip\_address | INET |  |  |

### 12.2 Fase 2: Inventory, Sales, Purchasing

**`categories`**: id, organization\_id, name, parent\_id (self FK).

**`units`**: id, organization\_id, name, symbol (contoh: Pcs, Kg, Box).

**`products`**

| Kolom | Tipe | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK |  |
| organization\_id | UUID | FK, NOT NULL |  |
| sku | VARCHAR(60) | NOT NULL | UNIQUE (organization\_id, sku) |
| name | VARCHAR(200) | NOT NULL |  |
| description | TEXT |  |  |
| category\_id | UUID | FK categories.id |  |
| unit\_id | UUID | FK units.id |  |
| cost\_price | NUMERIC(18,2) | DEFAULT 0 | Harga beli |
| sell\_price | NUMERIC(18,2) | DEFAULT 0 | Harga jual |
| min\_stock | NUMERIC(18,3) | DEFAULT 0 | Ambang peringatan |
| track\_stock | BOOLEAN | DEFAULT true |  |
| is\_active | BOOLEAN | DEFAULT true |  |
| image\_url | TEXT |  |  |

**`warehouses`**: id, organization\_id, code, name, address, is\_default.

**`stock_levels`**: product\_id (FK), warehouse\_id (FK), quantity NUMERIC(18,3); PK (product\_id, warehouse\_id).

**`stock_movements`**

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | UUID | PK |
| organization\_id | UUID | FK |
| product\_id | UUID | FK |
| warehouse\_id | UUID | FK |
| type | VARCHAR(20) | in / out / adjustment / transfer |
| quantity | NUMERIC(18,3) | Positif atau negatif |
| reference\_type | VARCHAR(30) | sales\_order, purchase\_order, manual |
| reference\_id | UUID | ID dokumen sumber |
| note | TEXT |  |
| created\_by | UUID | FK users.id |

**`customers`** dan **`suppliers`** (struktur serupa): id, organization\_id, code, name, email, phone, address, tax\_id (NPWP), payment\_term\_days, is\_active.

**`sales_orders`**

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | UUID | PK |
| organization\_id | UUID | FK |
| order\_number | VARCHAR(30) | UNIQUE (organization\_id, order\_number) |
| customer\_id | UUID | FK customers.id |
| order\_date | DATE |  |
| status | VARCHAR(20) | draft / confirmed / shipped / completed / cancelled |
| subtotal | NUMERIC(18,2) |  |
| discount\_total | NUMERIC(18,2) |  |
| tax\_total | NUMERIC(18,2) | PPN |
| grand\_total | NUMERIC(18,2) |  |
| note | TEXT |  |
| created\_by | UUID | FK users.id |

**`sales_order_items`**: id, sales\_order\_id (FK), product\_id (FK), quantity, unit\_price, discount, tax\_rate, line\_total.

**`invoices`**: id, organization\_id, invoice\_number, sales\_order\_id (FK), customer\_id (FK), issue\_date, due\_date, status (unpaid / partial / paid / overdue / void), total, amount\_paid.

**`payments`**: id, organization\_id, invoice\_id (FK), amount, method (cash / transfer / qris / card), paid\_at, reference\_no, note.

**`purchase_orders`**: id, organization\_id, po\_number, supplier\_id (FK), order\_date, expected\_date, status (draft / ordered / received / cancelled), subtotal, tax\_total, grand\_total, note, created\_by.

**`purchase_order_items`**: id, purchase\_order\_id (FK), product\_id (FK), quantity, received\_quantity, unit\_cost, line\_total.

### 12.3 Fase 3 (Ringkasan Skema)

- **Finance:** `accounts` (chart of accounts), `journal_entries`, `journal_lines`, `bank_accounts`, `bank_transactions`.
- **HR:** `departments`, `employees`, `attendances`, `leave_requests`, `payrolls`.

### 12.4 Indeks dan Constraint Penting

```sql
CREATE UNIQUE INDEX ux_users_email ON users (LOWER(email));
CREATE INDEX ix_members_org ON organization_members (organization_id);
CREATE INDEX ix_sessions_user ON sessions (user_id) WHERE revoked_at IS NULL;
CREATE INDEX ix_audit_org_created ON audit_logs (organization_id, created_at DESC);
CREATE INDEX ix_products_org_name ON products (organization_id, name);
CREATE INDEX ix_stock_mv_product ON stock_movements (product_id, created_at DESC);
CREATE INDEX ix_invoices_due ON invoices (organization_id, status, due_date);
```

### 12.5 Contoh DDL Inti MVP

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  avatar_url TEXT,
  email_verified_at TIMESTAMPTZ,
  failed_login_count INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(10) NOT NULL DEFAULT 'system'
        CHECK (theme IN ('light','dark','system')),
  language VARCHAR(5) NOT NULL DEFAULT 'id',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
  sidebar_collapsed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 13. Spesifikasi API (MVP)

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Registrasi user dan organisasi | Tidak |
| POST | `/api/auth/signin` | Login | Tidak |
| POST | `/api/auth/signout` | Logout sesi saat ini | Ya |
| POST | `/api/auth/refresh` | Rotasi refresh token | Cookie |
| POST | `/api/auth/verify-email` | Verifikasi email | Tidak |
| POST | `/api/auth/forgot-password` | Kirim email reset | Tidak |
| POST | `/api/auth/reset-password` | Set kata sandi baru | Token |
| GET | `/api/me` | Profil user, organisasi aktif, role, izin | Ya |
| GET | `/api/dashboard/summary?period=` | Data KPI dan grafik | Ya |
| GET | `/api/settings` | Ambil preferensi user | Ya |
| PATCH | `/api/settings` | Ubah preferensi, contoh `{ "theme": "dark" }` | Ya |
| PATCH | `/api/me/password` | Ubah kata sandi | Ya |
| GET | `/api/me/sessions` | Daftar sesi aktif | Ya |
| DELETE | `/api/me/sessions/:id` | Cabut sesi | Ya |

**Format respons error standar:** `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "email": "..." } } }`

---

## 14. Kriteria Penerimaan Rilis MVP (Definition of Done)

- [ ] Lima halaman (Landing, Sign In, Sign Up, Dashboard, Settings) selesai dan responsif.
- [ ] Alur signup, verifikasi email, signin, signout, dan reset kata sandi berfungsi.
- [ ] Tema Terang/Gelap/Sistem berfungsi, tersimpan, dan tanpa flash.
- [ ] Isolasi data antar-organisasi lulus uji otomatis.
- [ ] RBAC membatasi tampilan dashboard sesuai role.
- [ ] Lulus audit keamanan dasar (OWASP Top 10) dan uji aksesibilitas WCAG AA.
- [ ] Dokumentasi API dan panduan deployment tersedia.

---

## 15. Pertanyaan Terbuka

1. Apakah verifikasi email wajib sebelum mengakses dashboard?
2. Apakah perlu login sosial (Google) pada MVP?
3. Model harga: gratis terbatas (freemium) atau uji coba 14 hari?
4. Apakah satu user boleh tergabung di banyak organisasi pada rilis pertama?
5. Apakah branding (palet warna, logo) ETERA sudah ada?
