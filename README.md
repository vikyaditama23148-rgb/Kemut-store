# KEMUT.STORE — Premium Marketplace

Full-stack e-commerce dibangun dari desain Stitch (`homepage`, `product_detail`, `search_filter`, `shopping_cart`, `checkout`) menggunakan **Next.js 14 (App Router)**, **Supabase** (Auth, Postgres, RLS), dan **Midtrans Snap** untuk pembayaran.

## Fitur

- Auth pelanggan (daftar, login, sign out) via Supabase Auth
- **Marketplace multi-seller**: siapa pun bisa daftar jadi seller di `/sell`, ditinjau & disetujui admin, lalu kelola toko sendiri di `/seller`
- Katalog produk (gabungan dari semua seller) + halaman detail + pencarian/filter (kategori, harga, sort)
- Keranjang belanja (Server Actions, real-time terhubung ke Supabase)
- Checkout dengan alamat pengiriman + pembayaran Midtrans Snap (kartu, e-wallet, VA, dll)
- Webhook Midtrans otomatis update status order (paid/cancelled/expired) + restock saat batal
- Riwayat pesanan pelanggan
- **Dashboard admin**: kelola produk semua seller, approve/reject/suspend seller, kelola status order, ringkasan statistik
- **Dashboard seller**: kelola produk milik sendiri (CRUD), lihat penjualan & pendapatan sendiri
- Row Level Security penuh di Supabase — pelanggan hanya lihat datanya sendiri, seller hanya kelola produk/penjualan miliknya, admin bisa kelola semua

## 1. Persiapan

```bash
cd kemut-store
npm install
cp .env.local.example .env.local
```

## 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** → jalankan **berurutan**:
   1. `supabase/schema.sql` (skema dasar: produk, order, cart, dll)
   2. `supabase/migration_marketplace.sql` (menambahkan tabel `sellers` + RLS multi-seller)
3. Buka **Project Settings → API**, salin:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (rahasia, jangan expose ke client!)
4. (Opsional) Aktifkan **Email confirmations** di Authentication → Providers sesuai kebutuhan.

### Menjadikan akun sebagai admin (pemilik platform)

Setelah mendaftar lewat `/register`, jalankan di SQL Editor Supabase:

```sql
update public.profiles set role = 'admin' where id = 'UUID_USER_ANDA';
```

UUID bisa dilihat di Authentication → Users.

### Alur menjadi seller (penjual)

1. User biasa login → buka `/sell` → isi form pendaftaran toko (nama toko, telepon, deskripsi). Status awal: `pending`.
2. Admin login → buka `/admin/sellers` → klik **Approve** (atau **Reject** dengan alasan).
3. Setelah disetujui, seller bisa akses `/seller` untuk menambah & kelola produk sendiri, serta melihat penjualannya di `/seller/orders`.
4. Produk yang dibuat seller otomatis muncul di katalog publik (homepage, search, detail) begitu disimpan.

## 3. Setup Midtrans

1. Daftar akun sandbox di [dashboard.midtrans.com](https://dashboard.midtrans.com) (mode Sandbox dulu untuk testing).
2. Settings → Access Keys → salin `Server Key` dan `Client Key` ke `.env.local`.
3. Settings → Configuration → isi **Payment Notification URL** dengan:
   ```
   https://domain-anda.com/api/midtrans/webhook
   ```
   Untuk testing lokal, gunakan [ngrok](https://ngrok.com) agar webhook bisa diakses publik:
   ```bash
   ngrok http 3000
   ```
   lalu pakai URL ngrok sebagai notification URL.

## 4. (Opsional) Isi data produk contoh

```bash
npm run seed
```

Atau tambahkan produk manual lewat `/admin/products/new` setelah login sebagai admin.

## 5. Jalankan di VSCode

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Struktur Proyek

```
src/
  app/                    → routing (App Router)
    page.tsx              → homepage
    products/[slug]/      → detail produk
    search/                → pencarian & filter
    cart/                  → keranjang (server actions)
    checkout/               → checkout + integrasi Midtrans
    login/ register/       → auth
    sell/                   → form pendaftaran seller + status
    account/                → profil, alamat, riwayat order
    admin/                  → dashboard admin (produk, sellers, order)
    seller/                 → dashboard seller (produk & penjualan sendiri)
    api/checkout/           → buat order + Snap transaction
    api/midtrans/webhook/   → terima notifikasi pembayaran
  components/             → komponen UI (Navbar, ProductCard, ProductForm, dll)
  lib/supabase/           → client browser/server/admin
  lib/midtrans.ts         → helper Midtrans + format Rupiah
  types/database.ts       → tipe TypeScript untuk tabel Supabase
supabase/schema.sql               → skema dasar (produk, order, cart, dll)
supabase/migration_marketplace.sql → tambahan tabel sellers + RLS multi-seller
scripts/seed.ts           → seed data produk contoh
```

## Alur Pembayaran

1. User klik **Pay Now** di `/checkout` → `POST /api/checkout`.
2. Server membuat order (`status: pending_payment`), mengurangi stok, lalu membuat transaksi Midtrans Snap dan mengembalikan `snapToken`.
3. Browser membuka popup Snap (`window.snap.pay`) menggunakan token tersebut.
4. Setelah pembayaran, Midtrans mengirim notifikasi ke `/api/midtrans/webhook`, yang memverifikasi signature lalu mengubah status order menjadi `paid` (atau `cancelled`/`expired`, sekaligus mengembalikan stok jika gagal).

## Catatan Keamanan

- `SUPABASE_SERVICE_ROLE_KEY` dan `MIDTRANS_SERVER_KEY` hanya dipakai di server (API routes/admin client) — tidak pernah dikirim ke browser.
- Semua harga & validasi stok dihitung ulang di server saat checkout, bukan dipercaya dari client.
- RLS Postgres memastikan pelanggan hanya bisa mengakses data miliknya sendiri; akses admin diverifikasi lewat kolom `role` di tabel `profiles`.

## Deploy

Direkomendasikan deploy ke **Vercel**:

```bash
vercel
```

Tambahkan seluruh environment variable dari `.env.local` di Vercel Project Settings, lalu update Midtrans Notification URL ke domain production dan ubah `MIDTRANS_IS_PRODUCTION=true` saat go-live.
