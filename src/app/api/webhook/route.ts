
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

    // Log para depuração no console do servidor
    console.log('Webhook PushinPay Recebido:', JSON.stringify(body, null, 2));

    /**
     * Captura o ID da transação e o Status.
     * Gateways variam os nomes, então buscamos nos campos mais comuns.
     */
    const transactionId = body.id || body.transaction_id || (body.data && body.data.id);
    const status = (body.status || (body.data && body.data.status))?.toLowerCase();

    // Lista de status que consideramos como "Aprovado/Pago"
    const approvedStatuses = ['paid', 'approved', 'succeeded', 'completed', 'pago', 'aprovado'];

    if (transactionId && approvedStatuses.includes(status)) {
      const purchaseRef = doc(db, 'purchases', String(transactionId));
      
      await setDoc(purchaseRef, {
        id: transactionId,
        status: status,
        email: body.customer?.email || body.email || 'N/A',
        timestamp: serverTimestamp(),
        rawData: body
      }, { merge: true });

      return NextResponse.json({ success: true, message: 'Purchase Recorded' }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: 'Webhook processed (no action taken)' }, { status: 200 });
  } catch (error) {
    console.error('Erro no Webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
