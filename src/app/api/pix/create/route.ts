
import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerEmail, customerName, customerCpf, customerPhone, tracking } = body;

    if (!IRONPAY_TOKEN) {
      return NextResponse.json({ error: 'Erro de autenticação no pagamento. Contate o suporte.' }, { status: 401 });
    }

    const offerHash = process.env.IRONPAY_OFFER_HASH;
    const productHash = process.env.IRONPAY_PRODUCT_HASH;
    const amountInCents = Number(process.env.PRODUCT_PRICE) || 1990;
    const productTitle = process.env.PRODUCT_TITLE || "Estratégia Unban FF";

    if (!offerHash || !productHash) {
      return NextResponse.json({ error: 'Configuração de produto ausente. Contate o suporte.' }, { status: 500 });
    }

    // Payload seguindo rigorosamente o exemplo da documentação de Checkout Transparente
    const payload = {
      amount: amountInCents,
      offer_hash: offerHash.trim(),
      payment_method: "pix",
      customer: {
        name: (customerName || "Jogador").trim(),
        email: (customerEmail || "").trim(),
        phone_number: (customerPhone || "21988887777").replace(/\D/g, ""),
        document: (customerCpf || "").replace(/\D/g, ""),
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
          product_hash: productHash.trim(),
          title: productTitle,
          price: amountInCents,
          quantity: 1,
          operation_type: 1,
          tangible: false
        }
      ],
      expire_in_days: 1,
      transaction_origin: "api",
      tracking: tracking || {
        src: "",
        utm_source: "",
        utm_medium: "",
        utm_campaign: "",
        utm_term: "",
        utm_content: ""
      },
      postback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dexban-x-2.web.app'}/api/pix/webhook`
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
      console.error('Erro IronPay:', result);
      let errorMessage = 'Erro no sistema de pagamento. Tente novamente.';
      
      if (response.status === 422) {
        errorMessage = 'Algum dado informado está incorreto. Revise CPF, email e telefone.';
      } else if (response.status === 401) {
        errorMessage = 'Erro de autenticação no pagamento. Contate o suporte.';
      } else if (response.status === 400) {
        errorMessage = 'Dados inválidos. Verifique suas informações.';
      }

      return NextResponse.json({ 
        error: errorMessage,
        details: result
      }, { status: response.status });
    }

    const data = result.data || result;
    
    // Mapeamento exaustivo para encontrar o código Pix e QR Code conforme resposta real da API
    const hash = data.transaction_hash || data.hash || data.id || data.reference;
    
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
        error: 'O sistema de pagamento está instável. Tente novamente em alguns instantes.',
        details: 'Missing pix_code in response'
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
    console.error('Internal Error:', error);
    return NextResponse.json({ error: 'O sistema de pagamento está instável. Tente novamente em alguns instantes.' }, { status: 500 });
  }
}
