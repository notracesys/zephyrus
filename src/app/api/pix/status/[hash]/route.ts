import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function GET(
  request: Request,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params;
    if (!IRONPAY_TOKEN) {
      return NextResponse.json({ error: 'Token não configurado' }, { status: 500 });
    }

    // Consulta de transação conforme documentação
    const response = await fetch(`${IRONPAY_URL}/${hash}?api_token=${IRONPAY_TOKEN}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      return NextResponse.json({ status: 'pending' });
    }

    const data = await response.json();
    const result = data.data || data;
    const rawStatus = String(result.status || '').toLowerCase();

    // Mapeamento de status comum
    let finalStatus = 'pending';
    if (['paid', 'approved', 'succeeded', 'pago', 'aprovado'].includes(rawStatus)) {
      finalStatus = 'paid';
    } else if (['canceled', 'expired', 'failed', 'cancelado', 'expirado', 'falhou'].includes(rawStatus)) {
      finalStatus = 'failed';
    }

    return NextResponse.json({ status: finalStatus });

  } catch (error: any) {
    return NextResponse.json({ status: 'pending' });
  }
}
