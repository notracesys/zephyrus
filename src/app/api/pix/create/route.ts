import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerEmail, customerName, customerCpf } = body;

    console.log('[IronPay] Iniciando criação de Pix...');

    if (!IRONPAY_TOKEN) {
      return NextResponse.json({ 
        error: 'IRONPAY_API_TOKEN não configurado no servidor.',
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

    // Payload seguindo rigorosamente o exemplo da documentação para Checkout Transparente
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
      console.error(`[IronPay] Erro da API (${response.status}):`, JSON.stringify(result, null, 2));
      return NextResponse.json({ 
        error: result.message || result.error || 'Erro na operadora de pagamentos.',
        details: result.errors || result
      }, { status: response.status });
    }

    // A IronPay costuma retornar os dados dentro de um objeto 'data'
    const data = result.data || result;
    
    // Mapeamento ULTRA flexível para encontrar os dados do Pix na resposta
    const hash = data.transaction_hash || data.hash || data.id || data.reference || (data.transaction && data.transaction.hash);
    
    // Procura o código copia e cola em todos os campos possíveis usados por gateways brasileiros
    const pixCode = data.pix_code || 
                    data.pix_copy_paste || 
                    data.copy_paste || 
                    data.pix_copia_e_cola || 
                    data.brcode || 
                    data.qrcode_string || 
                    data.pix_qrcode || 
                    data.pix_code_raw ||
                    data.pix_code_url ||
                    (data.payment && (data.payment.pix_code || data.payment.brcode));

    const qrCodeImage = data.qr_code || 
                        data.qr_code_base64 || 
                        data.pix_qrcode_base64 || 
                        data.qrcode || 
                        data.pix_qrcode ||
                        (data.payment && data.payment.qr_code);

    if (!hash || !pixCode) {
      console.error('[IronPay] Resposta sem dados Pix. Objeto recebido:', JSON.stringify(result, null, 2));
      return NextResponse.json({ 
        error: 'A venda foi criada no seu painel, mas o sistema não conseguiu ler o código Pix. Verifique se o método Pix está configurado corretamente na sua Oferta na IronPay.',
        debug_keys: Object.keys(data),
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
    console.error('[IronPay] Erro fatal no servidor:', error);
    return NextResponse.json({ error: 'Erro interno ao processar Pix.' }, { status: 500 });
  }
}
