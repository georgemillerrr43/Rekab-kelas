export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    // Validate file type and extension
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak valid! Sistem HANYA menerima foto (JPEG/PNG). Unggah file video dilarang!' },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Ekstensi file ditolak! Hanya ekstensi .jpg, .jpeg, dan .png yang diizinkan.' },
        { status: 400 }
      );
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar! Batas maksimal adalah 2MB.' },
        { status: 400 }
      );
    }

    // Convert ke Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true }).catch(() => {});

    const uniqueId = Math.random().toString(36).substring(2, 10) + '-' + Date.now();
    const cleanFileName = `bukti-${uniqueId}.${fileExtension}`;
    const filePath = join(uploadDir, cleanFileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/api/uploads/${cleanFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: cleanFileName,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server saat memproses unggahan file.' },
      { status: 500 }
    );
  }
}
