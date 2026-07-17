import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = getSession(request);

    // Guru hanya bisa lihat kelasnya sendiri
    if (session?.role === 'GURU') {
      const guru = await prisma.guru.findUnique({
        where: { id: session.userId },
        include: { kelas: { include: { _count: { select: { siswa: true } } } } },
      });
      return NextResponse.json({ kelas: guru?.kelas ? [guru.kelas] : [] });
    }

    const kelas = await prisma.kelas.findMany({
      include: { _count: { select: { siswa: true } } },
      orderBy: { nama: 'asc' },
    });
    return NextResponse.json({ kelas });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data kelas' }, { status: 500 });
  }
}
