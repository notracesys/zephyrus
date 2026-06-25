import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Inicialização segura para rotas de API
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // A IronPay envia transaction_hash ou id
    const hash = body.transaction_hash || body.id || body.reference;
    const status = String(body.status || '').toLowerCase();

    const approvedStatuses = ['paid', 'approved', 'succeeded', 'pago', 'aprovado'];

    if (hash && approvedStatuses.includes(status)) {
      const docRef = doc(db, 'purchases', String(hash));
      await updateDoc(docRef, {
        status: 'paid',
        paidAt: serverTimestamp(),
      });
    }

    // Sempre responder 200 para a operadora não tentar reenviar infinitamente
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro no Webhook IronPay:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
