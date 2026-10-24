import { NextResponse } from 'next/server';
import { getRestaurantSettings, updateRestaurantSettings, clearDemoData, reloadDemoData, resetAllBills } from '@/lib/db';
import { getOwnerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getOwnerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = getRestaurantSettings();
    return NextResponse.json({
      name: settings.name,
      address: settings.address,
      contact_number: settings.contact_number,
      gstin: settings.gstin || '',
      tax_rate: settings.tax_rate,
      receipt_footer: settings.receipt_footer,
      owner_pin: settings.owner_pin,
      owner_username: settings.owner_username,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getOwnerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updated = updateRestaurantSettings(body);

    return NextResponse.json({
      success: true,
      message: 'Restaurant settings updated successfully',
      settings: {
        name: updated.name,
        address: updated.address,
        contact_number: updated.contact_number,
        gstin: updated.gstin,
        tax_rate: updated.tax_rate,
        receipt_footer: updated.receipt_footer,
        owner_pin: updated.owner_pin,
        owner_username: updated.owner_username,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getOwnerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'clear_demo') {
      const res = clearDemoData();
      return NextResponse.json({ success: true, message: `Removed ${res.deleted} demo bills.` });
    }

    if (action === 'reload_demo') {
      reloadDemoData();
      return NextResponse.json({ success: true, message: 'Sample demo bills reloaded.' });
    }

    if (action === 'reset_all') {
      const res = resetAllBills();
      return NextResponse.json({ success: true, message: `All ${res.deleted} bills have been cleared.` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
