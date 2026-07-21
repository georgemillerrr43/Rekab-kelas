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
      { href: '/recap/public', label: 'Rekap Publik' },
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
    <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-deep)] mt-6 md:mt-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-10">
        <div className="flex flex-wrap gap-x-8 gap-y-5 md:gap-10">
          {/* Brand */}
          <div className="w-full md:w-auto md:max-w-[200px] space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[7px] bg-gradient-to-br from-[var(--brand)] to-[#818cf8] flex items-center justify-center text-white font-extrabold text-[9px] shadow-sm shadow-[var(--brand-glow)]">
                RK
              </div>
              <span className="text-[13px] font-extrabold text-[var(--text-primary)] tracking-tight">Rekap<span className="text-[var(--brand)]">Kelas</span></span>
            </div>
            <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">Sistem absensi digital modern.</p>
          </div>

          {/* Menu */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Menu</h4>
            <ul className="space-y-1">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[13px] text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Layanan */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Layanan</h4>
            <ul className="space-y-1">
              {['Absensi Digital', 'Rekap Otomatis', 'Siap Cetak'].map((item) => (
                <li key={item} className="text-[13px] text-[var(--text-muted)]">{item}</li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Info</h4>
            <ul className="space-y-1">
              <li className="text-[13px] text-[var(--text-muted)]">v1.0.0</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 md:mt-8 pt-3 md:pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-1">
          <p className="text-xs text-[var(--text-muted)]">&copy; {new Date().getFullYear()} RekapKelas</p>
          <p className="text-xs text-[var(--text-muted)]">Dibuat oleh <span className="font-semibold text-[var(--text-secondary)]">Joji</span></p>
        </div>
      </div>
    </footer>
  );
}
