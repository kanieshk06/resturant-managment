import { NextResponse } from 'next/server';
import { validateOwnerCredentials, setOwnerSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin, username, password } = body;

    const identifier = pin || username || '';
    const pass = password || undefined;

    const isValid = validateOwnerCredentials(identifier, pass);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid PIN or credentials. Default PIN is 1234.' },
        { status: 401 }
      );
    }

    await setOwnerSession(username || 'owner');
    return NextResponse.json({ success: true, message: 'Logged in successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
