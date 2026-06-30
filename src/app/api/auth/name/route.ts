export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptSession, getSession } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  try {
    const { newName } = await request.json();

    if (!newName || newName.trim().length < 2 || newName.length > 100) {
      return NextResponse.json({ error: 'Nama harus 2-100 karakter' }, { status: 400 });
    }

    if (session.role === 'ADMIN') {
      await prisma.admin.update({ where: { id: session.userId }, data: { nama: newName.trim() } });
    } else if (session.role === 'GURU') {
      await prisma.guru.update({ where: { id: session.userId }, data: { nama: newName.trim() } });
    } else if (session.role === 'SISWA') {
      await prisma.siswa.update({ where: { id: session.userId }, data: { nama: newName.trim() } });
    } else {
      return NextResponse.json({ error: 'Role tidak dikenal' }, { status: 400 });
    }

    // Rebuild session with new name
    const newSession = { ...session, nama: newName.trim() };
    const token = encryptSession(newSession);

    const response = NextResponse.json({ success: true, nama: newName.trim() });
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Gagal mengubah nama' }, { status: 500 });
  }
}
