import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tracking } = body;

    const IRONPAY_TOKEN = (process.env.IRONPAY_API_TOKEN || '').trim();
    const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';
    
    console.log(`[PIX_CREATE] Iniciando transação. Token presente: ${!!IRONPAY_TOKEN}`);

    if (!IRONPAY_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuração de API ausente (IRONPAY_API_TOKEN).' 
      }, { status: 500 });
    }

    const amountInCents = Number(process.env.PRODUCT_PRICE) || 1990;
    const offerHash = (process.env.IRONPAY_OFFER_HASH || "").trim();
    const productHash = (process.env.IRONPAY_PRODUCT_HASH || "").trim();
    const productTitle = process.env.PRODUCT_TITLE || "Estratégia Unban FF";
    
    // Limpeza da URL do App
    let appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
    if (appUrl && !appUrl.startsWith('http')) {
      appUrl = `https://${appUrl}`;
    }
    appUrl = appUrl.replace(/\/$/, ''); // Remove barra no final

    const payload: any = {
      amount: amountInCents,
      offer_hash: offerHash,
      payment_method: "pix",
      customer: {
        name: "Jogador Anonimo",
        email: "cliente@suporte-recuperacao.com",
        phone_number: "11999999999",
        document: "09115751031"
      },
      cart: [
        {
          product_hash: productHash,
          title: productTitle,
          price: amountInCents,
          quantity: 1,
          operation_type: 1,
          tangible: false
        }
      ],
      expire_in_days: 1,
      transaction_origin: "api",
      tracking: tracking || {}
    };

    // Só adiciona postback_url se a URL parecer minimamente válida
    // A IronPay exige uma URL válida se o campo for enviado
    if (appUrl && appUrl.includes('.') && appUrl.startsWith('http')) {
      payload.postback_url = `${appUrl}/api/pix/webhook`;
      console.log(`[PIX_CREATE] Postback URL definida: ${payload.postback_url}`);
    } else {
      console.warn(`[PIX_CREATE] NEXT_PUBLIC_APP_URL não configurada ou inválida: "${appUrl}". O postback pode falhar.`);
    }

    const apiUrl = `${IRONPAY_URL}?api_token=${IRONPAY_TOKEN}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[IRONPAY_ERROR]", JSON.stringify(data, null, 2));
      return NextResponse.json({ 
        success: false,
        error: data.message || `Erro IronPay: ${response.status}`,
        details: data
      }, { status: response.status });
    }

    // Normalização baseada na documentação fornecida: data.pix.pix_qr_code
    const pixData = data.pix || {};
    const pixCode = pixData.pix_qr_code || ""; 
    const hash = data.hash || data.id;

    if (!pixCode) {
      console.error("[PIX_ERROR] Resposta da IronPay não contém pix_qr_code:", JSON.stringify(data, null, 2));
      return NextResponse.json({
        success: false,
        message: "O PIX foi criado, mas o código de pagamento (pix_qr_code) não foi retornado.",
        raw: data
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      transaction: {
        hash: String(hash),
        status: data.payment_status || "pending",
        amount: amountInCents
      },
      pix: {
        copyPaste: pixCode,
        qrCode: null 
      }
    });

  } catch (error: any) {
    console.error('[INTERNAL_SERVER_ERROR]', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno no servidor.' 
    }, { status: 500 });
  }
}
