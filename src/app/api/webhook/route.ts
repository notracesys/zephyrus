
import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Inicializa Firebase no lado do servidor para o Route Handler
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Log para depuração (Remova em produção se necessário)
    console.log('Webhook recebido do PushinPay:', body);

    /**
     * IMPORTANTE: Verifique a documentação do PushinPay para validar o Token/Assinatura
     * e o status da transação (ex: 'paid' ou 'approved').
     */
    const status = body.status;
    const transactionId = body.id || body.transaction_id;

    if (status === 'paid' || status === 'approved' || status === 'succeeded') {
      const purchaseRef = doc(db, 'purchases', String(transactionId));
      
      await setDoc(purchaseRef, {
        id: transactionId,
        status: status,
        email: body.customer?.email || 'N/A',
        timestamp: serverTimestamp(),
        rawData: body
      }, { merge: true });

      return NextResponse.json({ received: true, status: 'Purchase Recorded' }, { status: 200 });
    }

    return NextResponse.json({ received: true, status: 'Ignored (Not Paid)' }, { status: 200 });
  } catch (error) {
    console.error('Erro no Webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
