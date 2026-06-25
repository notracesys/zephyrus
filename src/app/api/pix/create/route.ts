import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerEmail, customerName, customerCpf } = body;

    // Log para depuração no console do servidor
    console.log('[IronPay] Iniciando criação de Pix...');

    if (!IRONPAY_TOKEN) {
      console.error('[IronPay] ERRO: IRONPAY_API_TOKEN não encontrado no .env');
      return NextResponse.json({ 
        error: 'Configuração do servidor incompleta (Token ausente).',
      }, { status: 500 });
    }

    const offerHash = process.env.IRONPAY_OFFER_HASH;
    const productHash = process.env.IRONPAY_PRODUCT_HASH;

    if (!offerHash || !productHash) {
      console.error('[IronPay] ERRO: IRONPAY_OFFER_HASH ou IRONPAY_PRODUCT_HASH não configurados.');
      return NextResponse.json({ 
        error: 'Hashes de oferta ou produto não configurados no .env.',
      }, { status: 500 });
    }

    const amountInCents = 1990; // R$ 19,90 fixo

    // Payload seguindo estritamente o exemplo da documentação
    const payload = {
      amount: amountInCents,
      offer_hash: offerHash,
      payment_method: "pix",
      customer: {
        name: (customerName || "Jogador Zephyrus").trim(),
        email: (customerEmail || "contato@zephyrus.com").trim(),
        phone_number: "21988887777",
        document: (customerCpf || "12345678909").replace(/\D/g, ""), // CPF "fictício" mas no formato correto
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
          product_hash: productHash,
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

    const data = result.data || result;
    
    // Mapeamento flexível de campos de retorno do Pix
    const hash = data.transaction_hash || data.hash || data.id || data.reference;
    const pixCode = data.pix_code || data.pix_copy_paste || data.copy_paste || data.brcode || data.qrcode_string || data.pix_qrcode || data.pix_code_raw;
    const qrCodeImage = data.qr_code || data.qr_code_base64 || data.qrcode;

    if (!hash || !pixCode) {
      console.error('[IronPay] Sucesso na API, mas campos Pix não encontrados:', result);
      return NextResponse.json({ error: 'Resposta da API incompleta (faltam dados do Pix).' }, { status: 500 });
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
    return NextResponse.json({ error: 'Erro interno ao processar Pix. Tente novamente.' }, { status: 500 });
  }
}