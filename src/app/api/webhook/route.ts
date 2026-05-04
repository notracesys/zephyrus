
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(request: Request) {
  console.log('--- PROCESSANDO WEBHOOK PUSHINPAY ---');
  
  try {
    const rawText = await request.text();
    console.log('Dados Brutos:', rawText);

    if (!rawText || rawText.trim() === '') {
      return NextResponse.json({ success: true, message: 'Empty body' }, { status: 200 });
    }

    let body: any = {};
    const looksLikeJson = rawText.trim().startsWith('{');

    if (looksLikeJson) {
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

    // Capturamos todos os IDs possíveis para garantir
    const transactionId = body.transaction_id || body.reference || (body.data && body.data.id);
    const notificationId = body.id;
    const rawStatus = body.status || (body.data && body.data.status) || '';
    const status = String(rawStatus).toLowerCase().trim();

    console.log(`IDs detectados -> Transação: ${transactionId} | Notificação: ${notificationId}`);

    const approvedStatuses = ['paid', 'approved', 'succeeded', 'completed', 'pago', 'aprovado', 'paga'];

    if (approvedStatuses.includes(status)) {
      const purchaseData = {
        status: status,
        email: body.email || body.customer?.email || 'N/A',
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rawBody: body // Guardamos para debug se necessário
      };

      // Grava no ID da transação
      if (transactionId) {
        await setDoc(doc(db, 'purchases', String(transactionId)), { ...purchaseData, id: String(transactionId) }, { merge: true });
        console.log(`Acesso liberado para ID de Transação: ${transactionId}`);
      }

      // Grava também no ID da notificação (alguns gateways usam esse no redirect)
      if (notificationId && notificationId !== transactionId) {
        await setDoc(doc(db, 'purchases', String(notificationId)), { ...purchaseData, id: String(notificationId) }, { merge: true });
        console.log(`Acesso liberado para ID de Notificação: ${notificationId}`);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('ERRO NO WEBHOOK:', error.message);
    return NextResponse.json({ success: true, error: error.message }, { status: 200 });
  }
}
