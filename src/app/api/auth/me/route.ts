import { NextResponse } from 'next/server';
import { getOwnerSession } from '@/lib/auth';
import { getRestaurantSettings } from '@/lib/db';

export async function GET() {
  const session = await getOwnerSession();
  const settings = getRestaurantSettings();

  return NextResponse.json({
    authenticated: !!session,
    username: session?.username || null,
    restaurant: {
      name: settings.name,
      address: settings.address,
      contact_number: settings.contact_number,
      tax_rate: settings.tax_rate,
      gstin: settings.gstin,
    },
  });
}
