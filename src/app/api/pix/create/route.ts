import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function POST(request: Request) {
  try {
    const { amount, customerEmail, customerName, customerCpf } = await request.json();

    if (!IRONPAY_TOKEN) {
      return NextResponse.json({ error: 'IRONPAY_API_TOKEN não configurado' }, { status: 500 });
    }

    const price = amount || 1990;

    // Payload seguindo EXATAMENTE o exemplo da documentação
    const payload = {
      amount: price,
      offer_hash: process.env.IRONPAY_OFFER_HASH || "7becb", // Hash da Oferta (deve estar no .env)
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
          product_hash: process.env.IRONPAY_PRODUCT_HASH || "7tjdfkshdv", // Hash do Produto (deve estar no .env)
          title: "Unban Strategy - Recuperação de Conta",
          cover: null,
          price: price,
          quantity: 1,
          operation_type: 1,
          tangible: false
        }
      ],
      expire_in_days: 1,
      transaction_origin: "api",
      tracking: {
        src: "",
        utm_source: "direct",
        utm_medium: "cpc",
        utm_campaign: "unban-strategy",
        utm_term: "",
        utm_content: ""
      },
      // URL de Webhook para confirmação automática
      postback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://zephyrus.com'}/api/pix/webhook`
    };

    // Autenticação via Query String conforme padrão da API
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
      console.error('Erro detalhado IronPay:', data);
      return NextResponse.json({ 
        error: 'Erro na operadora', 
        details: data.message || data.error || 'Verifique os dados enviados.'
      }, { status: ironPayResponse.status });
    }

    // Mapeamento dos campos de retorno para o Pix
    const result = data.data || data;
    const hash = result.transaction_hash || result.hash || result.id;
    const pixCode = result.pix_code || result.pix_copy_paste || result.copy_paste || result.brcode || result.qrcode_string;
    const qrCodeImage = result.qr_code || result.qr_code_base64;

    if (!hash || !pixCode) {
      return NextResponse.json({ 
        error: 'Resposta incompleta da operadora', 
        details: 'Hash ou Código Pix não encontrados no retorno.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      hash,
      pixCode,
      qrCodeImage,
      amount: price
    });

  } catch (error: any) {
    console.error('Erro interno criar Pix:', error);
    return NextResponse.json({ error: 'Erro interno ao processar Pix' }, { status: 500 });
  }
}
