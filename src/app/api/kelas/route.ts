import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const kelas = await prisma.kelas.findMany({
      include: { _count: { select: { siswa: true } } },
      orderBy: { nama: 'asc' },
    });
    return NextResponse.json({ kelas });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data kelas' }, { status: 500 });
  }
}
