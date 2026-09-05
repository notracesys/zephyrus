import { NextResponse } from 'next/server';

/**
 * Rota para criar transação na Sunize (Versão v2)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, tracking } = body;

    const SUNIZE_KEY = (process.env.SUNIZE_API_KEY || '').trim();
    const SUNIZE_SECRET = (process.env.SUNIZE_API_SECRET || '').trim();
    
    if (!SUNIZE_KEY || !SUNIZE_SECRET) {
      return NextResponse.json({ 
        success: false, 
        error: 'Chaves da API Sunize não configuradas.' 
      }, { status: 500 });
    }

    const amount = 29.90; // Valor fixo conforme solicitado
    const productTitle = process.env.PRODUCT_TITLE || "Estratégia Unban FF";
    const externalId = `unban_${Date.now()}_${customer.document.slice(-4)}`;

    const payload = {
      external_id: externalId,
      amount: amount,
      payment_method: "PIX",
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone.startsWith('+') ? customer.phone : `+55${customer.phone.replace(/\D/g, '')}`,
        document_type: "CPF",
        document: customer.document.replace(/\D/g, '')
      },
      items: [
        {
          id: "unban_strategy",
          title: productTitle,
          description: "Recuperação de conta",
          price: amount,
          quantity: 1,
          is_physical: false
        }
      ],
      tracking: tracking || {}
    };

    const response = await fetch('https://api.sunize.com.br/v2/transactions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': SUNIZE_KEY,
        'x-api-secret': SUNIZE_SECRET
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        success: false,
        error: data.message || `Erro Sunize: ${response.status}`,
        details: data
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      transaction: {
        hash: String(data.id),
        status: data.status || "PENDING",
        amount: data.amount * 100 // Convertendo para centavos para manter compatibilidade com o modal
      },
      pix: {
        copyPaste: data.pix?.payload || "",
        qrCode: null 
      }
    });

  } catch (error: any) {
    console.error('[SUNIZ_CREATE_ERROR]', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno ao processar pagamento.' 
    }, { status: 500 });
  }
}
