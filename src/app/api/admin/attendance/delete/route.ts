export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  const session = getSession(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tanggal = searchParams.get('tanggal');
  const kelas = searchParams.get('kelas');

  if (!tanggal || !kelas) {
    return NextResponse.json({ error: 'Parameter tanggal dan kelas wajib diisi.' }, { status: 400 });
  }

  try {
    const targetDate = new Date(tanggal);

    let kelasRecord = await prisma.kelas.findFirst({
      where: { OR: [{ id: kelas }, { nama: kelas }] },
    });
    if (!kelasRecord) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    const students = await prisma.siswa.findMany({
      where: { kelasId: kelasRecord.id },
      select: { id: true },
    });

    const studentIds = students.map((s) => s.id);

    const kehadiranList = await prisma.kehadiran.findMany({
      where: { siswaId: { in: studentIds }, tanggal: targetDate },
      select: { id: true, izinId: true },
    });

    const izinIds = kehadiranList.filter((k) => k.izinId).map((k) => k.izinId!);

    await prisma.$transaction(async (tx) => {
      if (izinIds.length > 0) {
        await tx.izin.deleteMany({ where: { id: { in: izinIds } } });
      }
      await tx.kehadiran.deleteMany({ where: { siswaId: { in: studentIds }, tanggal: targetDate } });
    });

    return NextResponse.json({ success: true, deleted: kehadiranList.length });
  } catch (error) {
    console.error('DELETE /api/admin/attendance:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
