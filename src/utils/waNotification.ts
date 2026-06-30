const WEB_URL = 'https://rekab.rizkyperdana.my.id';
const RECAP_URL = `${WEB_URL}/recap/public`;

interface WANotificationPayload {
  namaSiswa: string;
  nis: string;
  tanggal: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';
  whatsappOrangTua: string;
  alasan?: string;
}

function buildMessage(payload: WANotificationPayload): string {
  const { namaSiswa, nis, tanggal, status, alasan } = payload;

  const formatTanggal = new Date(tanggal).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const header = '═══════════════════════════════\n*REKAP KELAS — PEMBERITAHUAN KEHADIRAN*\n═══════════════════════════════';
  const footer = `\n\n─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n*📱 Pantau Kehadiran Online*\nKunjungi: ${RECAP_URL}\nMasukkan NIS putra/putri Bapak/Ibu untuk melihat rekap kehadiran secara lengkap dan real-time.\n\n─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n${WEB_URL}\n*Sistem Absensi Sekolah*`;

  const studentInfo = `\n\nYth. Orang Tua/Wali dari\n👤 *${namaSiswa}* (NIS: ${nis})`;

  if (status === 'ALPA') {
    return `${header}${studentInfo}\n\n📅 *${formatTanggal}*\n\n❌ *STATUS: TIDAK HADIR (ALPA)*\n\nPutra/putri Bapak/Ibu tidak hadir tanpa keterangan pada hari tersebut. Mohon konfirmasi ke Wali Kelas.${footer}`;
  }

  if (status === 'IZIN' || status === 'SAKIT') {
    const label = status === 'IZIN' ? 'IZIN' : 'SAKIT';
    const icon = status === 'IZIN' ? '📝' : '🤒';
    return `${header}${studentInfo}\n\n📅 *${formatTanggal}*\n\n${icon} *STATUS: ${label}*\n📋 Alasan: ${alasan || '-'}\n\nTerima kasih telah memberikan keterangan.${footer}`;
  }

  return `${header}${studentInfo}\n\n📅 *${formatTanggal}*\n\n✅ *STATUS: HADIR*\n\nPutra/putri Bapak/Ibu tercatat hadir tepat waktu.${footer}`;
}

function extractCountryCode(number: string): string {
  // Bersihin dulu: spasi, strip, + prefix
  const c = number?.trim().replace(/[\s\-]/g, '').replace(/^\+/, '') || '';
  if (!c) return '';
  const first = c[0];
  // Single-digit country codes: US/CA (1), Russia/Kazakhstan (7)
  if (first === '1' || first === '7') return first;
  // Sisanya pake 2 digit awal (62, 44, 91, 81, 86, dll)
  return c.slice(0, 2);
}

export async function sendWhatsAppNotification(payload: WANotificationPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const { whatsappOrangTua } = payload;

  if (!whatsappOrangTua) {
    return {
      success: false,
      error: 'Nomor WhatsApp orang tua tidak diisi.',
    };
  }

  const token = process.env.WA_API_TOKEN;
  const gatewayUrl = process.env.WA_GATEWAY_URL || 'https://api.fonnte.com/send';

  // If no token configured, log and return (for development/testing)
  if (!token || token === 'isi_nanti' || token.startsWith('api_token_anda')) {
    console.log('[WA] Token belum dikonfigurasi. Lewati pengiriman WA ke', whatsappOrangTua);
    return {
      success: false,
      error: 'WA_API_TOKEN belum dikonfigurasi di .env',
    };
  }

  try {
    const messageText = buildMessage(payload);
    const countryCode = extractCountryCode(whatsappOrangTua);

    const body: Record<string, any> = {
      target: whatsappOrangTua,
      message: messageText,
    };
    if (countryCode) body.countryCode = countryCode;

    const res = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[WA] Gagal mengirim:', data);
      return { success: false, error: data?.reason || data?.message || 'Gagal mengirim WA' };
    }

    return {
      success: true,
      messageId: data?.id || `msg_${Date.now()}`,
    };
  } catch (err) {
    console.error('[WA] Error:', err);
    return { success: false, error: 'Gagal terhubung ke gateway WA' };
  }
}
