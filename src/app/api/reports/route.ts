import { NextResponse } from 'next/server';
import { getReportsData } from '@/lib/billing-service';
import { getOwnerSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getOwnerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;

    const data = getReportsData(date);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch reports' }, { status: 500 });
  }
}
