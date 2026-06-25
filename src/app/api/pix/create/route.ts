import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerEmail, customerName, customerCpf } = body;

    if (!IRONPAY_TOKEN) {
      console.error('[IronPay] Erro: IRONPAY_API_TOKEN não configurado.');
      return NextResponse.json({ error: 'Configuração do servidor incompleta.' }, { status: 500 });
    }

    const amountInCents = 1990; // R$ 19,90 fixo conforme solicitado

    // Payload estruturado conforme o exemplo de documentação de checkout transparente
    const payload = {
      amount: amountInCents,
      offer_hash: process.env.IRONPAY_OFFER_HASH || "7becb", // Valor do .env ou fallback de teste
      payment_method: "pix",
      customer: {
        name: (customerName || "Jogador FF").trim(),
        email: (customerEmail || "contato@zephyrus.com").trim(),
        phone_number: "21999999999",
        document: (customerCpf || "00000000000").replace(/\D/g, ""),
        street_name: "Rua das Flores",
        number: "123",
        complement: "Apt 45",
        neighborhood: "Centro",
        city: "Rio de Janeiro",
        state: "RJ",
        zip_code: "20040020"
      },
      cart: [
        {
          product_hash: process.env.IRONPAY_PRODUCT_HASH || "7tjdfkshdv", // Valor do .env ou fallback de teste
          title: "Unban Strategy - Recuperação de Conta",
          price: amountInCents,
          quantity: 1,
          operation_type: 1,
          tangible: false
        }
      ],
      expire_in_days: 1,
      transaction_origin: "api",
      postback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://zephyrus.com'}/api/pix/webhook`
    };

    // Log do payload para depuração (removendo o token por segurança)
    console.log('[IronPay] Enviando transação:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${IRONPAY_URL}?api_token=${IRONPAY_TOKEN}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`[IronPay] Erro ${response.status}:`, JSON.stringify(result, null, 2));
      return NextResponse.json({ 
        error: 'Erro na operadora', 
        details: result.message || result.error || 'Verifique os logs do servidor.'
      }, { status: response.status });
    }

    // Mapeamento flexível dos campos de retorno para o Pix
    const data = result.data || result;
    const hash = data.transaction_hash || data.hash || data.id;
    const pixCode = data.pix_code || data.pix_copy_paste || data.copy_paste || data.brcode || data.qrcode_string;
    const qrCodeImage = data.qr_code || data.qr_code_base64;

    if (!hash || !pixCode) {
      console.error('[IronPay] Resposta incompleta:', result);
      return NextResponse.json({ error: 'Resposta incompleta da operadora.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      hash,
      pixCode,
      qrCodeImage,
      amount: amountInCents
    });

  } catch (error: any) {
    console.error('[IronPay] Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno ao processar Pix' }, { status: 500 });
  }
}
