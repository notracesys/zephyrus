
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
    console.log('Dados Brutos Recebidos:', rawText);

    if (!rawText || rawText.trim() === '') {
      return NextResponse.json({ success: true, message: 'Corpo vazio' }, { status: 200 });
    }

    let body: any = {};
    const looksLikeJson = rawText.trim().startsWith('{');

    if (looksLikeJson) {
      try {
        body = JSON.parse(rawText);
      } catch (e) {
        // Se falhar o parse do JSON, tenta como form data
        const params = new URLSearchParams(rawText);
        body = Object.fromEntries(params.entries());
      }
    } else {
      // Formato formulário: id=xxx&status=pago
      const params = new URLSearchParams(rawText);
      body = Object.fromEntries(params.entries());
    }

    // Capturamos todos os IDs possíveis para garantir a liberação
    const transactionId = body.transaction_id || body.reference || (body.data && body.data.id) || body.id;
    const notificationId = body.id;
    const rawStatus = body.status || (body.data && body.data.status) || '';
    const status = String(rawStatus).toLowerCase().trim();

    console.log(`IDs detectados -> Transação: ${transactionId} | Notificação: ${notificationId} | Status: ${status}`);

    const approvedStatuses = ['paid', 'approved', 'succeeded', 'completed', 'pago', 'aprovado', 'paga'];

    if (approvedStatuses.includes(status)) {
      const purchaseData = {
        id: String(transactionId),
        status: status,
        email: body.email || body.customer?.email || 'N/A',
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
        accessed: false // Marcamos como não acessado inicialmente
      };

      // Grava no ID da transação (o que vem na URL do redirect)
      if (transactionId) {
        await setDoc(doc(db, 'purchases', String(transactionId)), purchaseData, { merge: true });
        console.log(`Acesso liberado para ID: ${transactionId}`);
      }

      // Garante que se o gateway enviar IDs diferentes, ambos funcionem
      if (notificationId && notificationId !== transactionId) {
        await setDoc(doc(db, 'purchases', String(notificationId)), { ...purchaseData, id: String(notificationId) }, { merge: true });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('ERRO CRÍTICO NO WEBHOOK:', error.message);
    // Retornamos 200 para evitar que o gateway fique tentando reenviar infinitamente se for erro de lógica
    return NextResponse.json({ success: true, error: error.message }, { status: 200 });
  }
}
