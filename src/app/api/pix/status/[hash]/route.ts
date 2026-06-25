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

    // Consulta incluindo o token em todas as requisições conforme passo 2
    const response = await fetch(`${IRONPAY_URL}/${hash}?api_token=${IRONPAY_TOKEN}`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      return NextResponse.json({ status: 'pending', error: 'Falha ao consultar operadora' });
    }

    const data = await response.json();
    const result = data.data || data;
    const rawStatus = result.status || '';
    const status = String(rawStatus).toLowerCase();

    let finalStatus = 'pending';
    if (['paid', 'approved', 'succeeded', 'pago', 'aprovado'].includes(status)) {
      finalStatus = 'paid';
    } else if (['canceled', 'expired', 'failed', 'cancelado', 'expirado'].includes(status)) {
      finalStatus = 'failed';
    }

    return NextResponse.json({ status: finalStatus });

  } catch (error: any) {
    return NextResponse.json({ status: 'pending', error: error.message });
  }
}
