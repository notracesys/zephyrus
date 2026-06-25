import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function POST(request: Request) {
  try {
    const { amount, customerEmail, customerName, customerCpf, offerHash } = await request.json();

    if (!IRONPAY_TOKEN) {
      return NextResponse.json({ error: 'IRONPAY_API_TOKEN não configurado no servidor' }, { status: 500 });
    }

    // A IronPay exige o offer_hash. O hash abaixo deve ser substituído pelo real do seu painel.
    const finalOfferHash = offerHash || 'unban-strategy-standard';

    // Definindo os itens do carrinho conforme exigência da API
    // O erro indicou que 'cart.0.price' é obrigatório, então usamos 'price' em vez de 'unit_price'
    const cartItems = [
      {
        title: 'Unban Strategy - Recuperação de Conta',
        price: amount || 1990,
        unit_price: amount || 1990,
        quantity: 1,
        tangible: false
      }
    ];

    const payload = {
      api_token: IRONPAY_TOKEN,
      amount: amount || 1990,
      payment_method: 'pix',
      offer_hash: finalOfferHash,
      customer: {
        name: (customerName || 'Jogador FF').trim(),
        email: (customerEmail || 'contato@zephyrus.com').trim(),
        cpf: (customerCpf || '00000000000').replace(/\D/g, ''),
      },
      // Enviando 'cart' e 'items' para garantir compatibilidade
      cart: cartItems,
      items: cartItems
    };

    // Envio do token via query string conforme o passo 2 da documentação
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
        details: data.message || data.error || (data.errors ? JSON.stringify(data.errors) : 'Verifique se o offer_hash e o cart estão corretos') 
      }, { status: ironPayResponse.status });
    }

    const result = data.data || data;
    
    // Mapeamento robusto para encontrar os dados do Pix no retorno da API
    const hash = result.transaction_hash || result.id || result.hash || result.reference;
    const pixCode = result.pix_code || result.pix_copy_paste || result.copy_paste || result.brcode || result.qrcode_string || result.pix_code_string;
    const qrCodeImage = result.qr_code || result.qr_code_base64 || result.qrcode || result.qr_code_url;

    if (!hash || !pixCode) {
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
    console.error('Erro interno na rota Pix:', error);
    return NextResponse.json({ error: 'Erro interno ao processar Pix' }, { status: 500 });
  }
}
