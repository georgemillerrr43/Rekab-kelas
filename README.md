# RekapKelas — Sistem Absensi Digital

**RekapKelas** adalah aplikasi absensi digital berbasis web untuk sekolah. Dibangun dengan **Next.js 14**, **Prisma ORM**, dan **MySQL**.

## Kenapa RekapKelas Dibuat?

Aplikasi ini dibuat karena di banyak sekolah, pencatatan kehadiran siswa masih manual — pake buku, kertas, atau spreadsheet yang gampang ilang, susah direkapitulasi, dan orang tua nggak tahu anaknya masuk sekolah atau tidak. Jadi butuh sistem yang:

1. **Modern** — catat kehadiran dari HP/laptop, nggak perlu buku fisik lagi
2. **Transparan** — siswa bisa lihat rekap kehadirannya sendiri
3. **Cepat** — guru tinggal pilih status (Hadir/Izin/Sakit/Alpa), selesai
4. **Otomatis** — WA langsung ke orang tua kalau anak alpa/izin/sakit
5. **Lengkap** — admin bisa kelola kelas, guru, siswa dari satu panel

## Alur Sistem (3 Peran)

```mermaid
flowchart TB
    subgraph SISWA["Siswa"]
        A1[Mengajukan Izin/Sakit]
        A2[Lihat Rekap Sendiri]
    end

    subgraph GURU["Guru / Wali Kelas"]
        B1[Catat Absensi Harian]
        B2[Setujui/Tolak Izin]
    end

    subgraph ADMIN["Admin"]
        C1[Kelola Data Kelas]
        C2[Kelola Guru & Siswa]
        C3[Pantau Semua Kelas]
    end

    A1 -->|Ajukan izin| B2
    A1 -->|Notifikasi WA| A2
    B1 -->|Notifikasi WA| A2
    B2 -->|Approved/Rejected| A1
    C1 --> B1
    C2 --> B1
    C3 --> B1
```

| Peran | Tugas Utama |
|-------|------------|
| **Siswa** | Login pakai NIS, lihat rekap kehadiran sendiri, ajukan izin/sakit dengan foto bukti |
| **Guru / Wali Kelas** | Catat absensi harian kelasnya, setujui/tolak izin siswa |
| **Admin** | Kelola data kelas, guru, dan siswa; pantau seluruh kelas |

## Fitur Utama

- **3 role login**: Admin, Guru, Siswa dengan dashboard masing-masing
- **Absensi harian**: Catat kehadiran dengan 4 status (Hadir / Izin / Sakit / Alpa)
- **Pengajuan izin digital**: Siswa upload foto bukti sebagai lampiran
- **Approval izin**: Guru setujui/tolak izin dengan verifikasi foto
- **Rekap PDF**: Unduh laporan bulanan atau harian dalam format PDF
- **Statistik visual**: Grafik dan ringkasan kehadiran di dashboard
- **Notifikasi WhatsApp otomatis**: Kirim pemberitahuan ke orang tua saat guru mencatat absensi — dikirim pas **input absensi**, bukan pas approval
- **Responsive**: Bisa dipakai dari HP maupun laptop
- **Dark/Light mode**: Tersedia kedua tema

## Notifikasi WhatsApp

Sistem otomatis mengirim notifikasi WhatsApp ke nomor orang tua siswa **saat guru/admin mencatat absensi** (bukan saat approval):

| Situasi | Dikirim ke | Trigger |
|---------|-----------|---------|
| Siswa **Alpa** | Orang tua | Guru/admin mencatat "Alpa" |
| **Izin/Sakit** | Orang tua | Guru/admin mencatat Izin/Sakit |

> Nomor WA support format internasional: `62812xxxx` (Indonesia), `79123456789` (Rusia), `1202555xxxx` (US), dll. **Wajib pake kode negara tanpa `+` dan tanpa `0` di depan.**

### Setup WA Gateway (Fonnte)

1. Daftar akun di [Fonnte](https://fonnte.com)
2. Salin **API Token** dari dashboard Fonnte
3. Isi token ke file `.env`:

```env
WA_API_TOKEN="isi_dengan_token_dari_fonnte"
WA_GATEWAY_URL="https://api.fonnte.com/send"
```

> **Catatan**: Jika `WA_API_TOKEN` kosong, WA tidak dikirim dan hanya muncul log di console. Sistem tetap berjalan normal.

## Tutorial Instalasi

### Prasyarat

- Node.js 18+
- MySQL 8+
- npm atau yarn

### 1. Clone Repository

```bash
git clone https://github.com/joji/rekabkelas.git
cd rekabkelas
```

### 2. Setup Environment Variable

```bash
cp .env.example .env
```

Edit file `.env`:

```env
DATABASE_URL="mysql://user:password@127.0.0.1:3306/db_rekabkelas"
PORT=3000
NODE_ENV=development
WA_API_TOKEN="isi_dengan_token_dari_fonnte"
WA_GATEWAY_URL="https://api.fonnte.com/send"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Migrasi Database & Seed Data Awal

```bash
# Untuk development (membuat database baru)
npx prisma migrate dev --name init

# Untuk production server (tidak perlu shadow database)
npx prisma db push
npx prisma db seed
```

Setelah seed, akun default yang tersedia:

| Akun | Username | Password | Role |
|------|----------|----------|------|
| Admin | `admin` | `admin123` | Admin |
| Guru XI-RPL-1 | `budixirpl1` | `guru123` | Guru |
| Guru XI-RPL-2 | `sitinurhaliza` | `guru123` | Guru |
| Guru XII-RPL-1 | `ahmadwijaya` | `guru123` | Guru |
| Siswa (10 akun) | `10001` - `10010` | `siswa123` | Siswa |

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000` di browser.

## Tutorial Penggunaan per Role

### Siswa

**Login**: pakai NIS sebagai username (contoh: `10001`), password `siswa123`

**Yang bisa dilakukan:**
- Lihat dashboard kehadiran pribadi — jumlah Hadir, Izin, Sakit, Alpa + persentase
- Ajukan Izin/Sakit — klik "Ajukan Izin", pilih jenis, isi alasan, upload foto bukti
- Pantau status pengajuan — PENDING (menunggu), APPROVED (disetujui), REJECTED (ditolak)
- Ganti password sendiri di halaman Pengaturan

### Guru / Wali Kelas

**Login**: buat akun guru lewat panel Admin, lalu login dengan username & password yang dibuat

**Yang bisa dilakukan:**
- Dashboard — ringkasan kelas (rata-rata kehadiran, total siswa)
- Input Absensi — pilih tanggal, catat kehadiran siswa (Hadir/Izin/Sakit/Alpa)
  - Izin/Sakit: alasan dan foto bukti wajib diisi
  - Kalau siswa Alpa atau Izin/Sakit, WA otomatis ke orang tua
- Approval Izin — lihat daftar izin siswa, setujui atau tolak
- Rekap & PDF — lihat rekap bulanan/harian, unduh PDF
- Ganti password sendiri di halaman Pengaturan

### Admin

**Login**: `admin` / `admin123`

**Yang bisa dilakukan:**
- Dashboard — statistik global, approval izin semua kelas, grafik, siswa dengan alpa tertinggi
- Manajemen — CRUD untuk Kelas, Guru, dan Siswa
- Absensi — catat absensi untuk kelas manapun
- Rekap & PDF — lihat rekap semua kelas, filter per kelas
- Ganti nama, username, dan password sendiri di halaman Pengaturan

## Struktur Folder

```text
rekabkelas/
├── prisma/
│   ├── schema.prisma      # Model database
│   └── seed.ts            # Data awal
├── src/
│   ├── app/
│   │   ├── page.tsx            # Dashboard Admin
│   │   ├── login/              # Halaman login
│   │   ├── approval/           # Approval izin (Admin)
│   │   ├── attendance/         # Absensi (Admin)
│   │   ├── management/         # CRUD kelas, guru, siswa
│   │   ├── recap/              # Rekap & PDF
│   │   │   └── public/         # Rekap publik (tanpa login)
│   │   ├── settings/           # Pengaturan akun
│   │   ├── teacher/            # Panel Guru
│   │   │   ├── page.tsx        # Dashboard Guru
│   │   │   ├── attendance/     # Absensi Guru
│   │   │   └── approval/       # Approval Guru
│   │   └── api/                # API routes
│   │       ├── admin/          # API Admin
│   │       ├── teacher/        # API Guru
│   │       ├── student/        # API Siswa
│   │       ├── auth/           # API Auth (login, password, username, name)
│   │       ├── classes/        # API Kelas
│   │       ├── recap/          # API Rekap
│   │       └── upload/         # API Upload
│   ├── components/             # Komponen UI
│   ├── lib/
│   │   ├── auth.ts             # Session & auth logic
│   │   └── prisma.ts           # Prisma client
│   └── utils/
│       ├── pdfExport.ts        # Generate PDF
│       └── waNotification.ts   # Notifikasi WA (Fonnte API)
├── public/uploads/        # Upload foto bukti
└── .env.example
```

## Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| Frontend | Next.js 14 (React), Tailwind CSS |
| Backend | Next.js API Routes (REST) |
| Database | MySQL via Prisma ORM |
| Auth | Session-based (AES-256-CBC encrypted cookie) |
| PDF | jsPDF + jspdf-autotable |
| Upload | Server file system |
| Notifikasi WA | Fonnte API |
