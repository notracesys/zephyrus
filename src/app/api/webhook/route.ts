import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(request: Request) {
  try {
    const rawText = await request.text();
    let body: any = {};
    
    // Tenta processar como JSON ou Form Data de forma robusta
    if (rawText.trim().startsWith('{')) {
      try {
        body = JSON.parse(rawText);
      } catch (e) {
        const params = new URLSearchParams(rawText);
        body = Object.fromEntries(params.entries());
      }
    } else {
      const params = new URLSearchParams(rawText);
      body = Object.fromEntries(params.entries());
    }

    // O PushinPay envia vários campos que podem ser o ID da transação
    const transactionId = body.transaction_id || body.reference || body.id || (body.data && body.data.id);
    const notificationId = body.id;
    
    const rawStatus = body.status || (body.data && body.data.status) || '';
    const status = String(rawStatus).toLowerCase().trim();

    // Aceitamos qualquer variação de "pago" ou "aprovado"
    const approvedStatuses = ['paid', 'approved', 'succeeded', 'completed', 'pago', 'aprovado', 'paga'];

    if (approvedStatuses.includes(status)) {
      const purchaseData = {
        id: String(transactionId),
        status: status,
        email: body.email || body.customer?.email || 'N/A',
        timestamp: serverTimestamp(),
        accessed: false // Inicializa como falso para permitir o primeiro acesso
      };

      // Grava a venda usando o ID da transação
      if (transactionId) {
        await setDoc(doc(db, 'purchases', String(transactionId)), purchaseData, { merge: true });
      }

      // Se o ID da notificação for diferente, gravamos nele também para garantir o acesso automático via URL
      if (notificationId && notificationId !== transactionId) {
        await setDoc(doc(db, 'purchases', String(notificationId)), purchaseData, { merge: true });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: true, error: error.message }, { status: 200 });
  }
}
