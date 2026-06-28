import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tracking } = body;

    if (!IRONPAY_TOKEN) {
      console.error("ERRO: IRONPAY_API_TOKEN não configurado nas variáveis de ambiente.");
      return NextResponse.json({ success: false, error: 'Configuração de pagamento ausente.' }, { status: 500 });
    }

    const amountInCents = Number(process.env.PRODUCT_PRICE) || 1990;
    const offerHash = (process.env.IRONPAY_OFFER_HASH || "").trim();
    const productHash = (process.env.IRONPAY_PRODUCT_HASH || "").trim();
    const productTitle = process.env.PRODUCT_TITLE || "Estratégia Unban FF";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    // Dados padrão para evitar que o usuário precise preencher, conforme solicitado
    const payload = {
      amount: amountInCents,
      offer_hash: offerHash,
      payment_method: "pix",
      customer: {
        name: "Jogador Anonimo",
        email: "cliente@suporte-recuperacao.com",
        phone_number: "11999999999",
        document: "09115751031", // CPF de exemplo válido
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
      console.error("IRONPAY_API_ERROR_DETAIL:", JSON.stringify(data, null, 2));
      return NextResponse.json({ 
        success: false,
        error: `Erro IronPay: ${response.status}`,
        details: data
      }, { status: response.status });
    }

    // Mapeamento direto conforme a documentação fornecida
    const pixData = data.pix || {};
    const pixCode = pixData.pix_qr_code || ""; 
    const hash = data.hash || data.id;

    if (!pixCode) {
      console.warn("IRONPAY_WARNING: Pix criado mas pix_qr_code veio vazio. Verifique se o Pix está ativo na conta IronPay.");
      return NextResponse.json({
        success: false,
        message: "A transação foi criada, mas o código PIX não foi retornado. Verifique se o método PIX está ativo no seu painel IronPay.",
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
    console.error('INTERNAL_SERVER_ERROR:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erro interno ao processar o pagamento.' 
    }, { status: 500 });
  }
}
