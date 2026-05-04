
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Inicializa Firebase de forma segura para o ambiente de servidor (Route Handler)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Log para depuração (visível nos logs do servidor/Netlify)
    console.log('Webhook Payload:', JSON.stringify(body, null, 2));

    /**
     * No PushinPay, o ID da transação costuma vir em 'id' ou 'transaction_id'.
     * O status pode vir em 'status'.
     */
    const transactionId = body.transaction_id || body.id || (body.data && body.data.id);
    
    // Pegamos o status e convertemos para minúsculo com segurança
    const rawStatus = body.status || (body.data && body.data.status) || '';
    const status = String(rawStatus).toLowerCase();

    // Lista de status que liberam o acesso
    const approvedStatuses = ['paid', 'approved', 'succeeded', 'completed', 'pago', 'aprovado'];

    if (!transactionId) {
      console.warn('Webhook recebido sem ID de transação');
      return NextResponse.json({ success: false, error: 'No transaction ID found' }, { status: 400 });
    }

    // Se o status for aprovado, registramos no Firestore
    if (approvedStatuses.includes(status)) {
      const purchaseRef = doc(db, 'purchases', String(transactionId));
      
      const purchaseData = {
        id: String(transactionId),
        status: status,
        email: body.customer?.email || body.email || 'N/A',
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(purchaseRef, purchaseData, { merge: true });
      
      console.log(`Venda aprovada e registrada: ${transactionId}`);
      return NextResponse.json({ success: true, message: 'Purchase recorded' }, { status: 200 });
    }

    // Se o status não for de aprovação (ex: pendente), retornamos 200 para o gateway não repetir
    console.log(`Webhook processado: Status ${status} para transação ${transactionId}`);
    return NextResponse.json({ success: true, message: 'Status received, no action needed' }, { status: 200 });

  } catch (error: any) {
    // Log detalhado do erro para você encontrar o motivo real
    console.error('ERRO CRÍTICO NO WEBHOOK:', error.message, error.stack);
    
    // Retornamos 500 apenas em erro real de código para o gateway tentar novamente mais tarde
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}
