import { NextResponse } from 'next/server';
import { getBillById } from '@/lib/billing-service';
import { getRestaurantSettings } from '@/lib/db';
import { getOwnerSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getOwnerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const bill = getBillById(id);

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    const restaurant = getRestaurantSettings();

    return NextResponse.json({
      bill,
      restaurant: {
        name: restaurant.name,
        address: restaurant.address,
        contact_number: restaurant.contact_number,
        gstin: restaurant.gstin,
        receipt_footer: restaurant.receipt_footer,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching bill' }, { status: 500 });
  }
}
