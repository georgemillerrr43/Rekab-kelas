import { NextRequest } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-rekap-kelas-9876543210-security';
const SESSION_COOKIE_NAME = 'session_token';
const BCRYPT_ROUNDS = 12; // Security vs performance balance

export interface SessionData {
  userId: string;
  username: string;
  role: 'ADMIN' | 'GURU' | 'SISWA';
  nama: string;
  nis?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Format: ROLE.encryptedHex
export function encryptSession(data: SessionData): string {
  const key = crypto.scryptSync(SECRET_KEY, 'salt-session', 32);
  const iv = Buffer.alloc(16, 0); 
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${data.role}.${encrypted}`;
}

export function decryptSession(encryptedData: string): SessionData | null {
  try {
    const parts = encryptedData.split('.');
    const rolePrefix = parts[0];
    const hexData = parts[1];

    if (!rolePrefix || !hexData) return null;

    const key = crypto.scryptSync(SECRET_KEY, 'salt-session', 32);
    const iv = Buffer.alloc(16, 0);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(hexData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    const parsed = JSON.parse(decrypted) as SessionData;

    // Validasi integritas data: role hasil dekripsi wajib sama dengan prefix
    if (parsed.role !== rolePrefix) return null;

    return parsed;
  } catch (err) {
    return null;
  }
}

// 4-6. Session helpers
export function getSession(req: NextRequest): SessionData | null {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;
  return decryptSession(cookie.value);
}

export function isAdmin(req: NextRequest): boolean {
  return getSession(req)?.role === 'ADMIN';
}

export function isSiswa(req: NextRequest): boolean {
  return getSession(req)?.role === 'SISWA';
}
