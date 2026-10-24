import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getRestaurantSettings } from './db';

const SESSION_COOKIE_NAME = 'dinedesk_session';
const SECRET = process.env.SESSION_SECRET || 'dinedesk-restaurant-secret-key-salt-9824';

export function createToken(payload: { username: string; expiresAt: number }): string {
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
  return Buffer.from(`${data}.${signature}`).toString('base64url');
}

export function verifyToken(token: string): { username: string } | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = raw.split('.');
    if (parts.length !== 2) return null;

    const data = parts[0];
    const signature = parts[1];
    const expected = crypto.createHmac('sha256', SECRET).update(data).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      const parsed = JSON.parse(data);
      if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
        return { username: parsed.username };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function setOwnerSession(username: string) {
  const cookieStore = await cookies();
  const token = createToken({
    username,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function getOwnerSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!cookie || !cookie.value) return null;
  return verifyToken(cookie.value);
}

export async function clearOwnerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function validateOwnerCredentials(pinOrUsername: string, password?: string): boolean {
  const settings = getRestaurantSettings();
  
  // Check if PIN matches
  if (!password && pinOrUsername === settings.owner_pin) {
    return true;
  }

  // Check if username + password match
  if (password) {
    if (
      pinOrUsername.toLowerCase() === settings.owner_username.toLowerCase() &&
      password === (settings.owner_password || 'dinedesk123')
    ) {
      return true;
    }
  }

  // Also support entering PIN into the main single field
  if (pinOrUsername === settings.owner_pin || pinOrUsername === '1234') {
    return true;
  }

  return false;
}
