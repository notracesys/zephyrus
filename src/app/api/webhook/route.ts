
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
    
    // Processamento robusto do corpo da requisição
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

    // Identifica o ID único da transação para evitar duplicidade no banco
    const transactionId = body.transaction_id || body.reference || body.id || (body.data && body.data.id);
    
    const rawStatus = body.status || (body.data && body.data.status) || '';
    const status = String(rawStatus).toLowerCase().trim();

    // Lista de status que consideramos como "Aprovado"
    const approvedStatuses = ['paid', 'approved', 'succeeded', 'completed', 'pago', 'aprovado', 'paga'];

    if (transactionId && approvedStatuses.includes(status)) {
      const cleanId = String(transactionId).trim();
      
      const purchaseData = {
        id: cleanId,
        status: status,
        email: body.email || body.customer?.email || 'N/A',
        timestamp: serverTimestamp(),
        accessed: false, 
        rawBody: rawText 
      };

      // Salva usando o ID da transação como ID do documento para garantir unicidade
      await setDoc(doc(db, 'purchases', cleanId), purchaseData, { merge: true });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: true, error: error.message }, { status: 200 });
  }
}
