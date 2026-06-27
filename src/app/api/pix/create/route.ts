import { NextResponse } from 'next/server';

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

// Função auxiliar para busca profunda de valores no JSON
function findDeepValue(obj: any, possibleKeys: string[]): any {
  if (!obj || typeof obj !== 'object') return null;

  for (const key of Object.keys(obj)) {
    if (possibleKeys.includes(key)) {
      return obj[key];
    }
    const value = obj[key];
    if (value && typeof value === 'object') {
      const nested = findDeepValue(value, possibleKeys);
      if (nested) return nested;
    }
  }
  return null;
}

// Sanitização básica para logs
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

function normalizeIronPayPixResponse(data: any) {
  const copyPasteKeys = [
    "pixCopyPaste", "pix_copy_paste", "pix_copia_cola", "copyPaste", "copy_paste", 
    "copia_cola", "brcode", "br_code", "emv", "qr_code_text", "qrCodeText", 
    "paymentCode", "payment_code", "code", "pix_code"
  ];

  const qrCodeKeys = [
    "qrCode", "qr_code", "qrcode", "qr_code_base64", "qrCodeBase64", 
    "qr_code_url", "qrCodeUrl", "pix_qrcode_base64"
  ];

  const hashKeys = ["hash", "transaction_hash", "transactionHash", "id", "reference"];
  const statusKeys = ["status", "payment_status", "transaction_status"];
  const amountKeys = ["amount", "value", "price", "total"];

  return {
    transaction: {
      hash: findDeepValue(data, hashKeys),
      status: findDeepValue(data, statusKeys) || "pending",
      amount: findDeepValue(data, amountKeys)
    },
    pix: {
      copyPaste: findDeepValue(data, copyPasteKeys),
      qrCode: findDeepValue(data, qrCodeKeys),
      expiresAt: findDeepValue(data, ["expires_at", "expiresAt", "expiration", "expire_at", "expire_in"])
    }
  };
}

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

    const payload = {
      amount: amountInCents,
      offer_hash: offerHash?.trim(),
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
          product_hash: productHash?.trim(),
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
    
    // Log detalhado e sanitizado no backend
    console.log("IRONPAY_RAW_RESPONSE", JSON.stringify(sanitizeIronPayResponse(data), null, 2));

    if (!response.ok) {
      return NextResponse.json({ 
        success: false,
        error: 'Erro no sistema de pagamento.',
        details: data
      }, { status: response.status });
    }

    const normalized = normalizeIronPayPixResponse(data);

    if (!normalized.pix.copyPaste && !normalized.pix.qrCode) {
      return NextResponse.json({
        success: false,
        message: "Transação criada, mas a IronPay não retornou os dados do PIX.",
        debugHint: "Verifique o log IRONPAY_RAW_RESPONSE no backend."
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      transaction: normalized.transaction,
      pix: normalized.pix,
      rawProvider: "ironpay"
    });

  } catch (error: any) {
    console.error('Internal Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'O sistema de pagamento está instável. Tente novamente em alguns instantes.' 
    }, { status: 500 });
  }
}
