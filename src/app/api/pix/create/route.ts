import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerEmail, customerName, customerCpf } = body;

    if (!IRONPAY_TOKEN) {
      return NextResponse.json({ 
        error: 'IRONPAY_API_TOKEN não configurado.',
      }, { status: 500 });
    }

    const offerHash = process.env.IRONPAY_OFFER_HASH;
    const productHash = process.env.IRONPAY_PRODUCT_HASH;

    if (!offerHash || !productHash) {
      return NextResponse.json({ 
        error: 'Hashes de oferta ou produto não configurados no .env.',
      }, { status: 500 });
    }

    const amountInCents = 1990;

    // Payload seguindo rigorosamente o exemplo da documentação
    const payload = {
      amount: amountInCents,
      offer_hash: offerHash.trim(),
      payment_method: "pix",
      customer: {
        name: (customerName || "Jogador Zephyrus").trim(),
        email: (customerEmail || "contato@zephyrus.com").trim(),
        phone_number: "21988887777",
        document: (customerCpf || "12345678909").replace(/\D/g, ""),
        street_name: "Rua Principal",
        number: "100",
        complement: "Apto",
        neighborhood: "Centro",
        city: "Sao Paulo",
        state: "SP",
        zip_code: "01001000"
      },
      cart: [
        {
          product_hash: productHash.trim(),
          title: "Estratégia Unban FF",
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
      return NextResponse.json({ 
        error: result.message || result.error || 'Erro na operadora de pagamentos.',
        details: result
      }, { status: response.status });
    }

    const data = result.data || result;
    
    // Mapeamento exaustivo para encontrar o código Pix e QR Code
    const hash = data.transaction_hash || data.hash || data.id || data.reference;
    
    // Procura o código copia e cola em múltiplos campos possíveis
    const pixCode = data.pix_code || 
                    data.pix_copy_paste || 
                    data.copy_paste || 
                    data.brcode || 
                    data.qrcode_string ||
                    (data.payment && (data.payment.pix_code || data.payment.brcode));

    const qrCodeImage = data.qr_code || 
                        data.qr_code_base64 || 
                        data.pix_qrcode_base64 || 
                        data.qrcode ||
                        (data.payment && data.payment.qr_code);

    if (!hash || !pixCode) {
      return NextResponse.json({ 
        error: 'Transação criada, mas dados do Pix não encontrados na resposta. Verifique as configurações de Pix na IronPay.',
        full_response: result
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      hash,
      pixCode,
      qrCodeImage,
      amount: amountInCents
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno ao processar Pix.' }, { status: 500 });
  }
}
