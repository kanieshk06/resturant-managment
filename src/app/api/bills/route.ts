import { NextResponse } from 'next/server';
import { getAllBills, createBill } from '@/lib/billing-service';
import { getOwnerSession } from '@/lib/auth';
import { getNextBillNumber } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getOwnerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const date = searchParams.get('date') || undefined;
    const paymentMethod = searchParams.get('paymentMethod') || undefined;

    const bills = getAllBills({ search, date, paymentMethod });
    const nextBillNumber = getNextBillNumber();

    return NextResponse.json({ bills, nextBillNumber });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch bills' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getOwnerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const newBill = createBill(body);

    return NextResponse.json({
      success: true,
      message: `Bill ${newBill.bill_number} generated successfully`,
      bill: newBill,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create bill' },
      { status: 400 }
    );
  }
}
