import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params;
    const SUNIZE_KEY = (process.env.SUNIZE_API_KEY || '').trim();
    const SUNIZE_SECRET = (process.env.SUNIZE_API_SECRET || '').trim();

    if (!SUNIZE_KEY || !SUNIZE_SECRET) {
      return NextResponse.json({ error: 'Credenciais ausentes' }, { status: 500 });
    }

    const response = await fetch(`https://api.sunize.com.br/v2/transactions/${hash}`, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'x-api-key': SUNIZE_KEY,
        'x-api-secret': SUNIZE_SECRET
      }
    });
    
    if (!response.ok) {
      return NextResponse.json({ status: 'pending' });
    }

    const data = await response.json();
    const rawStatus = String(data.status || '').toUpperCase();

    // Mapeamento Sunize v2: AUTHORIZED, PENDING, REFUNDED, etc.
    let finalStatus = 'pending';
    if (['AUTHORIZED', 'PAID', 'SUCCESS'].includes(rawStatus)) {
      finalStatus = 'paid';
    } else if (['FAILED', 'REFUNDED', 'CHARGEBACK'].includes(rawStatus)) {
      finalStatus = 'failed';
    }

    return NextResponse.json({ status: finalStatus });

  } catch (error: any) {
    return NextResponse.json({ status: 'pending' });
  }
}
