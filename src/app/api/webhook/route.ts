
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Inicializa Firebase de forma segura para o ambiente de servidor
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(request: Request) {
  try {
    // Lemos o corpo como texto bruto primeiro para evitar o erro de parsing automático
    const rawText = await request.text();
    let body: any = {};

    if (!rawText) {
      return NextResponse.json({ success: false, error: 'Empty body' }, { status: 200 });
    }

    // Tenta converter para JSON. Se falhar (que era o erro anterior), trata como Form Data.
    try {
      body = JSON.parse(rawText);
    } catch (e) {
      // Se cair aqui, é porque o corpo é "id=XXX&status=YYY"
      const params = new URLSearchParams(rawText);
      body = Object.fromEntries(params.entries());
    }

    console.log('Webhook Capturado com Sucesso:', JSON.stringify(body, null, 2));

    /**
     * Mapeamento flexível de campos para suportar qualquer versão da API do PushinPay
     */
    const transactionId = body.transaction_id || body.id || (body.data && body.data.id);
    const rawStatus = body.status || (body.data && body.data.status) || '';
    const status = String(rawStatus).toLowerCase().trim();

    // Status que liberam o acesso na hora
    const approvedStatuses = ['paid', 'approved', 'succeeded', 'completed', 'pago', 'aprovado'];

    if (!transactionId) {
      console.warn('Webhook ignorado: Nenhum ID identificado no corpo da requisição.');
      return NextResponse.json({ success: true, message: 'Received but no ID found' }, { status: 200 });
    }

    // Se o status for de aprovação, salvamos no Firestore
    if (approvedStatuses.includes(status)) {
      const purchaseRef = doc(db, 'purchases', String(transactionId));
      
      const purchaseData = {
        id: String(transactionId),
        status: status,
        email: body.customer?.email || body.email || 'N/A',
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
        raw_payload: rawText // Guardamos o original para conferência
      };

      await setDoc(purchaseRef, purchaseData, { merge: true });
      console.log(`ACESSO LIBERADO: Transação ${transactionId} confirmada.`);
    }

    // Sempre retornamos 200 para o gateway saber que recebemos a mensagem
    return NextResponse.json({ success: true, message: 'Processed' }, { status: 200 });

  } catch (error: any) {
    console.error('ERRO NO PROCESSAMENTO DO WEBHOOK:', error.message);
    
    // Retornamos 200 mesmo no erro para evitar que o gateway fique reenviando o erro original infinitamente
    return NextResponse.json({ 
      success: false,
      error: 'Processing Error', 
      details: error.message 
    }, { status: 200 });
  }
}
