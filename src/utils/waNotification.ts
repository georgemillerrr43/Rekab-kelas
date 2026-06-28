interface WANotificationPayload {
  namaSiswa: string;
  nis: string;
  tanggal: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';
  whatsappOrangTua: string;
  alasan?: string;
}

export async function sendWhatsAppNotification(payload: WANotificationPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const { whatsappOrangTua } = payload;

  if (!whatsappOrangTua || !whatsappOrangTua.startsWith('62')) {
    return {
      success: false,
      error: 'Nomor WhatsApp Orang Tua tidak valid. Harus dimulai dengan kode negara 62 (contoh: 628123456789).',
    };
  }

  // ponytail: simulation only
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    messageId: `msg_${Math.random().toString(36).substring(2, 15)}`,
  };
}
