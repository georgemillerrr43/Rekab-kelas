# RekapKelas — Sistem Absensi Digital

**RekapKelas** adalah aplikasi absensi digital berbasis web untuk sekolah. Dibangun dengan **Next.js 14**, **Prisma ORM**, dan **MySQL**.

## Alur Sistem (3 Peran)

```mermaid
flowchart TB
    subgraph SISWA["Siswa"]
        A1[Mengajukan Izin/Sakit]
        A2[Upload Foto Bukti]
        A3[Lihat Rekap Sendiri]
    end

    subgraph GURU["Guru / Wali Kelas"]
        B1[Catat Absensi Harian]
        B2[Setujui/Tolak Izin]
        B3[Unduh Rekap PDF]
    end

    subgraph ADMIN["Admin"]
        C1[Kelola Data Kelas]
        C2[Kelola Guru & Siswa]
        C3[Pantau Semua Kelas]
    end

    A1 -->|Ajukan izin| B2
    A2 --> B2
    A3 --> B3
    B1 --> C3
    B2 -->|Approved/Rejected| A1
    C1 --> B1
    C2 --> B1
```

| Peran | Tugas Utama |
|-------|------------|
| **Siswa** | Login pakai NIS, lihat rekap kehadiran sendiri, ajukan izin/sakit dengan foto bukti |
| **Guru / Wali Kelas** | Catat absensi harian kelasnya, setujui/tolak izin siswa, unduh rekap PDF |
| **Admin** | Kelola data kelas, guru, dan siswa; pantau seluruh kelas |

### Alur Lengkap

```mermaid
sequenceDiagram
    participant A as Admin
    participant G as Guru
    participant S as Siswa
    participant DB as Database

    A->>DB: Buat Kelas
    A->>DB: Buat Akun Guru
    A->>DB: Buat Data Siswa
    S->>DB: Login (NIS)
    S->>DB: Ajukan Izin/Sakit + Foto
    G->>DB: Login
    G->>DB: Catat Absensi Harian
    G->>DB: Setujui/Tolak Izin
    G-->>S: Status Approval
    Note right of S: Semua role bisa unduh rekap PDF
```

1. **Admin** login dan membuat data master: **Kelas** → **Guru** (Wali Kelas) → **Siswa**
2. **Siswa** login dengan NIS, bisa mengajukan **Izin** atau **Sakit** dengan mengisi alasan dan upload foto bukti
3. **Guru / Wali Kelas** login, membuka halaman absensi, memilih tanggal, dan mencatat kehadiran siswa (Hadir / Izin / Sakit / Alpa)
4. Jika ada siswa yang mengajukan izin, statusnya muncul sebagai **PENDING** di halaman Approval Guru — guru bisa menyetujui atau menolak
5. **Admin** bisa melihat semua data, mengelola user, dan memantau statistik kehadiran
6. Semua role bisa mengunduh **rekap PDF** bulanan atau harian

## Fitur Utama

- **3 role login**: Admin, Guru, Siswa dengan dashboard masing-masing
- **Absensi harian**: Catat kehadiran dengan 4 status (Hadir / Izin / Sakit / Alpa)
- **Pengajuan izin digital**: Siswa upload foto bukti sebagai lampiran
- **Approval izin**: Guru setujui/tolak izin dengan verifikasi foto
- **Rekap PDF**: Unduh laporan bulanan atau harian dalam format PDF
- **Statistik visual**: Grafik dan ringkasan kehadiran di dashboard
- **Notifikasi WhatsApp otomatis**: Kirim pemberitahuan ke orang tua saat guru mencatat absensi (Alpa / Izin / Sakit)
- **Ganti Username**: Setiap user bisa mengubah username sendiri di halaman pengaturan
- **Responsive**: Bisa dipakai dari HP maupun laptop
- **Dark/Light mode**: Tersedia kedua tema

## Notifikasi WhatsApp

Sistem otomatis mengirim notifikasi WhatsApp ke nomor orang tua siswa saat pencatatan absensi:

| Situasi | Dikirim ke | Trigger |
|---------|-----------|---------|
| Siswa **Alpa** | Orang tua | Guru/admin mencatat kehadiran "Alpa" |
| **Izin/Sakit** | Orang tua | Guru/admin mencatat absensi Izin atau Sakit |

### Setup WA Gateway (Fonnte)

1. Daftar akun di [Fonnte](https://fonnte.com)
2. Masuk ke dashboard Fonnte, salin **API Token** (ada di halaman Settings / API)
3. Isi token ke file `.env`:

```env
WA_API_TOKEN="isi_dengan_token_dari_fonnte"
WA_GATEWAY_URL="https://api.fonnte.com/send"
```

4. Pastikan nomor WA orang tua siswa diawali `628` (bukan `08`). Contoh: `6281234567890`

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

Perintah di atas akan membuat tabel-tabel database dan mengisi data awal:

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
- Lihat **dashboard kehadiran** pribadi — jumlah Hadir, Izin, Sakit, Alpa + persentase
- **Ajukan Izin/Sakit** — klik tombol "Ajukan Izin", pilih jenis, isi alasan, upload foto bukti, lalu kirim
- **Pantau status pengajuan** — PENDING (menunggu), APPROVED (disetujui), atau REJECTED (ditolak)

### Guru / Wali Kelas

**Login**: buat akun guru dulu lewat panel Admin, lalu login dengan username & password yang dibuat

**Yang bisa dilakukan:**
- **Dashboard Guru** — lihat ringkasan kelas (rata-rata kehadiran, total siswa)
- **Input Absensi** (`/teacher/attendance`) — pilih tanggal, catat kehadiran siswa satu per satu
  - Untuk yang Izin/Sakit: alasan dan foto bukti wajib diisi
  - Kalau sudah pernah disubmit, tampilkan ucapan sukses
- **Approval Izin** (`/teacher/approval`) — lihat daftar siswa yang mengajukan izin
  - Klik foto bukti untuk memperbesar
  - Setujui atau tolak
- **Rekap & PDF** (`/recap`) — lihat rekap bulanan/harian, unduh PDF

### Admin

**Login**: `admin` / `admin123`

**Yang bisa dilakukan:**
- **Dashboard Admin** — statistik global, approval izin semua kelas, grafik, siswa dengan alpa tertinggi
- **Manajemen** (`/management`) — CRUD untuk:
  - **Kelas** — tambah, edit, hapus kelas
  - **Guru** — tambah guru, assign ke kelas, lihat password plain
  - **Siswa** — tambah siswa, assign ke kelas, lihat password plain
- **Absensi Admin** (`/attendance`) — catat absensi untuk kelas manapun (override)
- **Rekap & PDF** (`/recap`) — lihat rekap semua kelas, filter per kelas

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
│   │   ├── approval/           # Approval izin
│   │   ├── attendance/         # Absensi (Admin)
│   │   ├── management/         # CRUD kelas, guru, siswa
│   │   ├── recap/              # Rekap & PDF
│   │   │   └── public/         # Rekap publik (tanpa login)
│   │   ├── settings/           # Pengaturan akun
│   │   ├── teacher/            # Panel Guru
│   │   │   ├── page.tsx        # Dashboard Guru
│   │   │   ├── attendance/     # Absensi Guru
│   │   │   └── approval/       # Approval Guru
│   │   ├── student/            # Dashboard Siswa
│   │   └── api/                # API routes
│   │       ├── admin/          # API Admin
│   │       ├── teacher/        # API Guru
│   │       ├── student/        # API Siswa
│   │       ├── classes/        # API Kelas (publik)
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
