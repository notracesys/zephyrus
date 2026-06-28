import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tracking } = body;

    // Acessando variáveis de ambiente de forma segura
    const IRONPAY_TOKEN = (process.env.IRONPAY_API_TOKEN || '').trim();
    const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';
    
    // Log para depuração na Netlify (não expõe o token inteiro por segurança)
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    // Estrutura exata conforme documentação enviada
    const payload = {
      amount: amountInCents,
      offer_hash: offerHash,
      payment_method: "pix",
      customer: {
        name: "Jogador Anonimo",
        email: "cliente@suporte-recuperacao.com",
        phone_number: "11999999999",
        document: "09115751031", // CPF padrão
        street_name: "Rua do Suporte",
        number: "100",
        neighborhood: "Centro",
        city: "Sao Paulo",
        state: "SP",
        zip_code: "01001000"
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
      tracking: tracking || {},
      postback_url: appUrl ? `${appUrl}/api/pix/webhook` : null
    };

    // Chamada para a IronPay com o token na URL conforme documentação
    const response = await fetch(`${IRONPAY_URL}?api_token=${IRONPAY_TOKEN}`, {
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
        error: `Erro IronPay: ${response.status}`,
        details: data
      }, { status: response.status });
    }

    // Mapeamento direto do campo pix_qr_code da resposta oficial
    const pixData = data.pix || {};
    const pixCode = pixData.pix_qr_code || ""; 
    const hash = data.hash || data.id;

    if (!pixCode) {
      console.warn("[IRONPAY_WARNING] Transação criada mas pix_qr_code veio vazio.");
      return NextResponse.json({
        success: false,
        message: "O PIX foi criado na conta, mas o código de pagamento não foi retornado.",
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
      error: 'Erro interno no servidor da Netlify.' 
    }, { status: 500 });
  }
}
