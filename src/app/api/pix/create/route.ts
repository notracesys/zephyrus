import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function POST(request: Request) {
  try {
    const { amount, customerEmail, customerName, customerCpf, offerHash } = await request.json();

    if (!IRONPAY_TOKEN) {
      console.error('IRONPAY_API_TOKEN não configurado no servidor');
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const payload = {
      amount: amount || 1990,
      payment_method: 'pix',
      // Campo obrigatório exigido pela IronPay
      offer_hash: offerHash || 'unban-strategy-standard',
      customer: {
        name: (customerName || 'Jogador FF').trim(),
        email: (customerEmail || 'contato@zephyrus.com').trim(),
        cpf: (customerCpf || '00000000000').replace(/\D/g, ''),
      },
      items: [
        {
          title: 'Unban Strategy - Recuperação de Conta',
          unit_price: amount || 1990,
          quantity: 1,
          tangible: false
        }
      ]
    };

    // Envio do token via query string e body para garantir compatibilidade
    const ironPayResponse = await fetch(`${IRONPAY_URL}?api_token=${IRONPAY_TOKEN}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    const data = await ironPayResponse.json();

    if (!ironPayResponse.ok) {
      console.error('Erro retornado pela IronPay:', data);
      return NextResponse.json({ 
        error: 'Erro na operadora de pagamento', 
        details: data.message || data.error || (data.errors ? JSON.stringify(data.errors) : 'Erro desconhecido') 
      }, { status: ironPayResponse.status });
    }

    // Mapeamento flexível de campos para capturar o hash e o código pix
    // A IronPay pode retornar os dados dentro de um objeto 'data' ou na raiz
    const result = data.data || data;
    const hash = result.transaction_hash || result.id || result.hash;
    const pixCode = result.pix_code || result.pix_copy_paste || result.copy_paste || result.brcode || result.qrcode_string;
    const qrCodeImage = result.qr_code || result.qr_code_base64 || result.qrcode;

    if (!hash || !pixCode) {
      console.error('Resposta da IronPay incompleta ou formato inesperado:', data);
      return NextResponse.json({ error: 'Resposta inválida da operadora. Campos hash ou pixCode ausentes.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      hash,
      pixCode,
      qrCodeImage,
      amount: amount || 1990
    });

  } catch (error: any) {
    console.error('Exceção na rota Pix Create:', error);
    return NextResponse.json({ error: 'Erro interno ao processar Pix' }, { status: 500 });
  }
}
