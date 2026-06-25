import { NextResponse } from 'next/server';

/**
 * Rota de Diagnóstico:
 * Acesse /api/ironpay-products para ver o JSON real dos seus produtos na IronPay.
 * Isso revelará se os campos necessários são product_hash, offer_hash, etc.
 */
export async function GET() {
  const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
  const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/products';

  if (!IRONPAY_TOKEN) {
    return NextResponse.json({ error: 'IRONPAY_API_TOKEN não configurado no .env' }, { status: 500 });
  }

  try {
    const response = await fetch(`${IRONPAY_URL}?api_token=${IRONPAY_TOKEN}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();

    return NextResponse.json({
      status: response.status,
      debug_info: "Inspecione este JSON para encontrar os hashes corretos",
      data: data
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Falha ao conectar com a IronPay', 
      details: error.message 
    }, { status: 500 });
  }
}
