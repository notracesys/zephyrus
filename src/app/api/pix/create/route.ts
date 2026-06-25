import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_OFFER_HASH = process.env.IRONPAY_OFFER_HASH;
const IRONPAY_PRODUCT_HASH = process.env.IRONPAY_PRODUCT_HASH;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function POST(request: Request) {
  try {
    const { amount, customerEmail, customerName, customerCpf } = await request.json();

    if (!IRONPAY_TOKEN) {
      return NextResponse.json({ error: 'IRONPAY_API_TOKEN não configurado' }, { status: 500 });
    }

    // A documentação exige offer_hash e product_hash. 
    // Usamos variáveis de ambiente ou valores de fallback baseados na sua conta.
    const offerHash = IRONPAY_OFFER_HASH || 'unban-strategy-standard';
    const productHash = IRONPAY_PRODUCT_HASH || offerHash;

    const item = {
      title: 'Unban Strategy - Recuperação de Conta',
      price: amount || 1990, // preço em centavos
      quantity: 1,
      tangible: false,
      product_hash: productHash
    };

    const payload = {
      api_token: IRONPAY_TOKEN,
      amount: amount || 1990,
      payment_method: 'pix',
      offer_hash: offerHash,
      product_hash: productHash,
      customer: {
        name: (customerName || 'Jogador FF').trim(),
        email: (customerEmail || 'contato@zephyrus.com').trim(),
        cpf: (customerCpf || '00000000000').replace(/\D/g, ''),
      },
      items: [item],
      cart: [item] // Algumas versões exigem o campo cart como array de itens
    };

    // Chamada seguindo o Passo 2: Token na URL + JSON no Body
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
      console.error('Erro IronPay:', data);
      return NextResponse.json({ 
        error: 'Erro na operadora', 
        details: data.message || data.error || (data.errors ? JSON.stringify(data.errors) : 'Verifique os hashes de oferta e produto no seu painel IronPay') 
      }, { status: ironPayResponse.status });
    }

    // A resposta pode vir no campo 'data' ou na raiz
    const result = data.data || data;
    
    // Mapeamento de campos comuns de Pix na IronPay
    const hash = result.transaction_hash || result.hash || result.id || result.reference;
    const pixCode = result.pix_code || result.pix_copy_paste || result.copy_paste || result.brcode || result.qrcode_string;
    const qrCodeImage = result.qr_code || result.qr_code_base64 || result.qrcode;

    if (!hash || !pixCode) {
      return NextResponse.json({ 
        error: 'Resposta incompleta da operadora', 
        details: 'Hash ou Pix Code não encontrados na resposta.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      hash,
      pixCode,
      qrCodeImage,
      amount: amount || 1990
    });

  } catch (error: any) {
    console.error('Erro interno criar Pix:', error);
    return NextResponse.json({ error: 'Erro interno ao processar Pix' }, { status: 500 });
  }
}
