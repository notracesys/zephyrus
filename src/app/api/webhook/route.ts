
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Inicializa Firebase de forma segura para o ambiente de servidor
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};

    // Detecta o formato do corpo da requisição (JSON ou Form Data)
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const text = await request.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    }

    console.log('Webhook Payload Recebido:', JSON.stringify(body, null, 2));

    /**
     * No PushinPay, o ID da transação pode vir em diversos campos.
     * Tentamos capturar o ID de todas as formas possíveis.
     */
    const transactionId = body.transaction_id || body.id || (body.data && body.data.id);
    
    // Pegamos o status e limpamos espaços
    const rawStatus = body.status || (body.data && body.data.status) || '';
    const status = String(rawStatus).toLowerCase().trim();

    // Lista de status que liberam o acesso
    const approvedStatuses = ['paid', 'approved', 'succeeded', 'completed', 'pago', 'aprovado'];

    if (!transactionId) {
      console.warn('Webhook ignorado: Nenhum ID de transação encontrado no corpo.');
      return NextResponse.json({ success: false, error: 'No transaction ID found' }, { status: 200 });
    }

    // Se o status for aprovado, registramos no Firestore para liberar o acesso
    if (approvedStatuses.includes(status)) {
      const purchaseRef = doc(db, 'purchases', String(transactionId));
      
      const purchaseData = {
        id: String(transactionId),
        status: status,
        email: body.customer?.email || body.email || 'N/A',
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Guardamos o corpo original para auditoria se necessário
        raw_payload: JSON.stringify(body)
      };

      await setDoc(purchaseRef, purchaseData, { merge: true });
      
      console.log(`ACESSO LIBERADO: Transação ${transactionId} marcada como PAGA.`);
      return NextResponse.json({ success: true, message: 'Purchase recorded and access granted' }, { status: 200 });
    }

    // Se o status não for de aprovação, apenas confirmamos o recebimento sem erro
    console.log(`LOG: Transação ${transactionId} recebida com status: ${status}. Nenhuma ação tomada.`);
    return NextResponse.json({ success: true, message: 'Status processed' }, { status: 200 });

  } catch (error: any) {
    console.error('ERRO NO WEBHOOK:', error.message);
    
    // Retornamos 200 com erro no corpo para evitar retentativas infinitas do gateway se for erro de parsing
    return NextResponse.json({ 
      success: false,
      error: 'Processing Error', 
      details: error.message 
    }, { status: 200 });
  }
}
