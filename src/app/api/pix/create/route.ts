import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function POST(request: Request) {
  try {
    const { amount, customerEmail, customerName, customerCpf } = await request.json();

    if (!IRONPAY_TOKEN) {
      console.error('IRONPAY_API_TOKEN não configurado no servidor');
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const payload = {
      amount: amount || 1990,
      payment_method: 'pix',
      customer: {
        name: customerName || 'Cliente FF',
        email: customerEmail || 'contato@zephyrus.com',
        cpf: customerCpf || '00000000000',
      },
      items: [
        {
          title: 'Unban Strategy - Recuperação de Conta',
          unit_price: amount || 1990,
          quantity: 1,
        }
      ]
    };

    // Tenta enviar o token tanto via query string quanto no corpo, dependendo da versão da API
    const ironPayResponse = await fetch(`${IRONPAY_URL}?api_token=${IRONPAY_TOKEN}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...payload,
        api_token: IRONPAY_TOKEN // redundância para garantir
      }),
    });

    const data = await ironPayResponse.json();

    if (!ironPayResponse.ok) {
      console.error('Erro retornado pela IronPay:', data);
      return NextResponse.json({ 
        error: 'Erro na operadora de pagamento', 
        details: data.message || data.error || 'Erro desconhecido' 
      }, { status: ironPayResponse.status });
    }

    // Mapeamento flexível de campos para capturar o hash e o código pix
    const hash = data.transaction_hash || data.id || data.hash || (data.data && (data.data.hash || data.data.id));
    const pixCode = data.pix_code || data.pixCode || data.pix_copy_paste || data.copy_paste || data.brcode || data.qrcode_string || (data.data && (data.data.pix_code || data.data.copy_paste));
    const qrCodeImage = data.qr_code || data.qrCode || data.qr_code_base64 || (data.data && (data.data.qr_code || data.data.qrCode));

    if (!hash || !pixCode) {
      console.error('Resposta da IronPay incompleta:', data);
      return NextResponse.json({ error: 'Resposta inválida da operadora' }, { status: 500 });
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
