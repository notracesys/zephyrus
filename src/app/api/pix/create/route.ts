import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

// Função para busca profunda de valores no objeto retornado pela API
function findDeepValue(obj: any, possibleKeys: string[]): any {
  if (!obj || typeof obj !== 'object') return null;

  for (const key of Object.keys(obj)) {
    // Verifica se a chave atual (em minúsculo) está na lista de chaves possíveis
    if (possibleKeys.map(k => k.toLowerCase()).includes(key.toLowerCase())) {
      return obj[key];
    }
    const value = obj[key];
    if (value && typeof value === 'object') {
      const found = findDeepValue(value, possibleKeys);
      if (found) return found;
    }
  }
  return null;
}

// Sanitização básica para logs de servidor (protege dados sensíveis)
function sanitizeIronPayResponse(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  const sensitive = ['api_token', 'document', 'phone_number', 'email', 'name', 'phone', 'cpf', 'customer'];
  
  for (const key of Object.keys(sanitized)) {
    if (sensitive.includes(key)) {
      sanitized[key] = '***';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeIronPayResponse(sanitized[key]);
    }
  }
  return sanitized;
}

function normalizeIronPayResponse(data: any) {
  // Chaves possíveis para o código PIX copia e cola
  const pixCopyPaste = findDeepValue(data, [
    "pix_copy_paste", "pixCopyPaste", "copy_paste", "copyPaste", "copia_cola", 
    "pix_copia_cola", "brcode", "br_code", "emv", "qr_code_text", "qrCodeText", 
    "payment_code", "paymentCode", "pix_code", "pix_key", "payload"
  ]);

  // Chaves possíveis para o QR Code (Base64 ou URL)
  const qrCode = findDeepValue(data, [
    "qr_code", "qrCode", "qrcode", "qr_code_base64", "qrCodeBase64", 
    "qr_code_url", "qrCodeUrl", "pix_qrcode_base64", "image", "base64"
  ]);

  // Chaves possíveis para a URL de checkout (caso o PIX falhe)
  const paymentUrl = findDeepValue(data, [
    "checkout_url", "payment_url", "paymentUrl", "url", "checkoutUrl", "link"
  ]);

  const hash = findDeepValue(data, [
    "hash", "transaction_hash", "transactionHash", "id", "reference", "uuid"
  ]);

  const status = findDeepValue(data, [
    "status", "payment_status", "transaction_status"
  ]) || "pending";

  const amount = findDeepValue(data, ["amount", "value", "price", "total", "cost"]);

  return {
    hash,
    status,
    pixCopyPaste,
    qrCode,
    paymentUrl,
    amount
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerEmail, customerName, customerCpf, customerPhone, tracking } = body;

    if (!IRONPAY_TOKEN) {
      return NextResponse.json({ success: false, error: 'Erro de autenticação no pagamento. Contate o suporte.' }, { status: 401 });
    }

    const amountInCents = Number(process.env.PRODUCT_PRICE) || 1990;
    
    const payload = {
      amount: amountInCents,
      offer_hash: (process.env.IRONPAY_OFFER_HASH || "").trim(),
      payment_method: "pix",
      customer: {
        name: (customerName || "Jogador").trim(),
        email: (customerEmail || "").trim(),
        phone_number: (customerPhone || "").replace(/\D/g, ""),
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
          product_hash: (process.env.IRONPAY_PRODUCT_HASH || "").trim(),
          title: process.env.PRODUCT_TITLE || "Estratégia Unban FF",
          price: amountInCents,
          quantity: 1,
          operation_type: 1,
          tangible: false
        }
      ],
      expire_in_days: 1,
      transaction_origin: "api",
      tracking: tracking || {},
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

    const data = await response.json();
    
    // Log de diagnóstico detalhado no terminal
    console.log("IRONPAY_STATUS:", response.status);
    console.log("IRONPAY_RAW_RESPONSE:", JSON.stringify(sanitizeIronPayResponse(data), null, 2));

    if (!response.ok) {
      return NextResponse.json({ 
        success: false,
        error: 'Erro no sistema de pagamento.',
        details: data
      }, { status: response.status });
    }

    const normalized = normalizeIronPayResponse(data);

    // PRIORIDADE 1: Se encontrou dados de PIX, exibe o modal
    if (normalized.pixCopyPaste || normalized.qrCode) {
      return NextResponse.json({
        success: true,
        mode: "pix",
        transaction: {
          hash: normalized.hash,
          status: normalized.status,
          amount: normalized.amount || amountInCents
        },
        pix: {
          copyPaste: normalized.pixCopyPaste,
          qrCode: normalized.qrCode
        }
      });
    }

    // PRIORIDADE 2: Se não tem PIX, mas tem URL, redireciona
    if (normalized.paymentUrl) {
      return NextResponse.json({
        success: true,
        mode: "payment_url",
        transaction: {
          hash: normalized.hash,
          status: normalized.status,
          amount: amountInCents
        },
        paymentUrl: normalized.paymentUrl
      });
    }

    // ERRO: Criou na IronPay mas não retornou nada útil para o cliente
    return NextResponse.json({
      success: false,
      message: "A transação foi criada, mas a IronPay não retornou os dados de pagamento na resposta da API.",
      action: "Inspecione o log IRONPAY_RAW_RESPONSE no terminal do servidor."
    }, { status: 502 });

  } catch (error: any) {
    console.error('Internal Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'O sistema de pagamento está instável. Tente novamente em alguns instantes.' 
    }, { status: 500 });
  }
}
