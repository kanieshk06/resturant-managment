import { NextResponse } from 'next/server';
import { getDashboardOverview } from '@/lib/billing-service';
import { getOwnerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getOwnerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = getDashboardOverview();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard' }, { status: 500 });
  }
}
