
import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function GET(
  request: Request,
  { params }: { params: { hash: string } }
) {
  try {
    const hash = params.hash;
    if (!IRONPAY_TOKEN) {
      return NextResponse.json({ error: 'Token não configurado' }, { status: 500 });
    }

    const response = await fetch(`${IRONPAY_URL}/${hash}?api_token=${IRONPAY_TOKEN}`);
    const data = await response.json();

    const rawStatus = data.status || '';
    const status = String(rawStatus).toLowerCase();

    // Mapeamento de status para um padrão simples
    let finalStatus = 'pending';
    if (['paid', 'approved', 'succeeded', 'pago', 'aprovado'].includes(status)) {
      finalStatus = 'paid';
    } else if (['canceled', 'expired', 'failed', 'cancelado', 'expirado'].includes(status)) {
      finalStatus = 'failed';
    }

    return NextResponse.json({ status: finalStatus, originalStatus: status });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
