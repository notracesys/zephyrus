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

    // Estrutura EXATA conforme a documentação pública da IronPay
    const payload = {
      amount: price,
      payment_method: 'pix',
      customer: {
        name: (customerName || 'Jogador FF').trim(),
        email: (customerEmail || 'contato@zephyrus.com').trim(),
        cpf: (customerCpf || '00000000000').replace(/\D/g, ''),
      },
      items: [
        {
          title: 'Unban Strategy - Recuperação de Conta',
          unit_price: price,
          quantity: 1
        }
      ]
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
      console.error('Erro IronPay:', data);
      return NextResponse.json({ 
        error: 'Erro na operadora', 
        details: data.message || data.error || 'Verifique os dados enviados.'
      }, { status: ironPayResponse.status });
    }

    // A resposta costuma vir em data ou na raiz
    const result = data.data || data;
    
    // Mapeamento dos campos de retorno para o Pix
    const hash = result.transaction_hash || result.hash || result.id;
    const pixCode = result.pix_code || result.pix_copy_paste || result.copy_paste || result.brcode || result.qrcode_string;
    const qrCodeImage = result.qr_code || result.qr_code_base64;

    if (!hash || !pixCode) {
      return NextResponse.json({ 
        error: 'Resposta incompleta da operadora', 
        details: 'Hash ou Código Pix não encontrados.' 
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
