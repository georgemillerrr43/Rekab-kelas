'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [session, setSession] = useState<{ isLoggedIn: boolean; role: string | null }>({ isLoggedIn: false, role: null });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) setSession(await res.json());
      } catch { /* ignore */ }
    })();
  }, []);

  const isAdmin = session.role === 'ADMIN';
  const isGuru = session.role === 'GURU';
  const isSiswa = session.role === 'SISWA';

  let quickLinks: { href: string; label: string }[] = [];
  if (!session.isLoggedIn) {
    quickLinks = [
      { href: '/recap/public', label: 'Rekap' },
      { href: '/login', label: 'Masuk' },
    ];
  } else if (isAdmin) {
    quickLinks = [
      { href: '/', label: 'Dashboard' },
      { href: '/attendance', label: 'Absensi' },
      { href: '/approval', label: 'Approval' },
      { href: '/recap', label: 'Rekap' },
      { href: '/management', label: 'Manajemen' },
      { href: '/settings', label: 'Pengaturan' },
    ];
  } else if (isGuru) {
    quickLinks = [
      { href: '/teacher', label: 'Dashboard' },
      { href: '/teacher/attendance', label: 'Absensi' },
      { href: '/teacher/approval', label: 'Approval' },
      { href: '/recap', label: 'Rekap' },
      { href: '/settings', label: 'Pengaturan' },
    ];
  } else if (isSiswa) {
    quickLinks = [
      { href: '/student', label: 'Beranda' },
      { href: '/recap', label: 'Rekap' },
      { href: '/settings', label: 'Pengaturan' },
    ];
  }

  return (
    <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-deep)] mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[var(--brand)] to-[#60a5fa] flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-[var(--brand-glow)]">
                RK
              </div>
              <span className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">
                Rekap<span className="text-[var(--brand)]">Kelas</span>
              </span>
            </div>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed max-w-xs">
              Sistem absensi digital modern untuk guru, wali kelas, dan siswa. Transparan, real-time, dan siap cetak.
            </p>
          </div>

          {/* Akses Cepat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Akses Cepat</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[13px] text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Layanan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Layanan</h4>
            <ul className="space-y-2">
              <li className="text-[13px] text-[var(--text-muted)]">Absensi Digital</li>
              <li className="text-[13px] text-[var(--text-muted)]">Rekap Otomatis</li>
              <li className="text-[13px] text-[var(--text-muted)]">Laporan Siap Cetak</li>
            </ul>
          </div>

          {/* Tentang */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Tentang</h4>
            <ul className="space-y-2">
              <li className="text-[13px] text-[var(--text-muted)]">Sistem Informasi Akademik</li>
              <li className="text-[13px] text-[var(--text-muted)]">Manajemen Absensi Terpadu</li>
              <li className="text-[13px] text-[var(--text-muted)]">Versi 1.0.0</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} RekapKelas. All rights reserved.
          </p>
          <p className="text-[12px] text-[var(--text-muted)]">
            Dibuat oleh <span className="font-semibold text-[var(--text-secondary)]">Joji</span>
          </p>
        </div>
      </div>
    </footer>
  );
}