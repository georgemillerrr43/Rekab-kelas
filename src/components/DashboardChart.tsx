'use client';

import React from 'react';

interface DashboardChartProps {
  dataMingguan?: { hari: string; persen: number }[];
  dataDistribusi?: { label: string; value: number; color: string }[];
}

export default function DashboardChart({
  dataMingguan,
  dataDistribusi = [],
}: DashboardChartProps) {
  const hasWeeklyData = dataMingguan && dataMingguan.length > 0 && dataMingguan.some(d => d.persen >= 0 && d.persen <= 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Weekly trend — only show if data is meaningful */}
      {hasWeeklyData ? (
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Tren Kehadiran Mingguan</h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">Persentase kehadiran per hari.</p>
          <div className="flex items-end justify-between gap-3 h-40">
            {dataMingguan.map((item) => {
              const pct = Math.min(Math.max(item.persen, 0), 100);
              return (
                <div key={item.hari} className="flex flex-col items-center flex-1 h-full justify-end">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] mb-1">
                    {pct}%
                  </span>
                  <div className="w-full bg-[var(--bg-glass)] rounded-[var(--radius-pill)] overflow-hidden flex items-end"
                    style={{ height: '100%', maxHeight: '120px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-[var(--brand)] to-[#60a5fa] rounded-[var(--radius-pill)] transition-all duration-500"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--text-muted)] mt-2">{item.hari}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="lg:col-span-2 glass-card p-5 flex items-center justify-center">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            <p className="text-xs text-[var(--text-muted)]">Data mingguan belum tersedia</p>
          </div>
        </div>
      )}

      {/* Distribution stats — simple list, no donut */}
      <div className="glass-card p-5">
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Distribusi Kehadiran</h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">Total akumulasi bulan ini.</p>
        {dataDistribusi.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)] text-xs">Belum ada data.</div>
        ) : (
          <div className="space-y-3">
            {dataDistribusi.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[var(--text-secondary)]">{item.label}</span>
                  <span className="font-bold text-[var(--text-primary)]">{item.value}%</span>
                </div>
                <div className="h-2 bg-[var(--bg-glass)] rounded-[var(--radius-pill)] overflow-hidden">
                  <div className={`h-full rounded-[var(--radius-pill)] transition-all duration-500 ${item.color || 'bg-[var(--brand)]'}`}
                    style={{ width: `${Math.min(Math.max(item.value, 0), 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
