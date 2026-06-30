export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptSession, getSession } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const session = getSession(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Akses ditolak. Hanya Admin.' }, { status: 403 });
  }

  try {
    const { newUsername } = await request.json();

    if (!newUsername || newUsername.length < 3 || newUsername.length > 50) {
      return NextResponse.json({ error: 'Username harus 3-50 karakter' }, { status: 400 });
    }

    // Check if username already taken by any role
    const [adminDup, guruDup, siswaDup] = await Promise.all([
      prisma.admin.findUnique({ where: { username: newUsername } }),
      prisma.guru.findUnique({ where: { username: newUsername } }),
      prisma.siswa.findUnique({ where: { username: newUsername } }),
    ]);
    if (adminDup || guruDup || siswaDup) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
    }

    // Only admin can change username — via this API
    await prisma.admin.update({ where: { id: session.userId }, data: { username: newUsername } });

    // Rebuild session with new username
    const newSession = { ...session, username: newUsername };
    const token = encryptSession(newSession);

    const response = NextResponse.json({ success: true, username: newUsername });
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Gagal mengubah username' }, { status: 500 });
  }
}
