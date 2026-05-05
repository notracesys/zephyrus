
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

    // Mapeamento exaustivo de IDs possíveis enviados pelo PushinPay
    const transactionId = body.transaction_id || body.reference || body.id || (body.data && body.data.id);
    const notificationId = body.id;
    const externalId = body.external_reference || body.external_id;
    
    const rawStatus = body.status || (body.data && body.data.status) || '';
    const status = String(rawStatus).toLowerCase().trim();

    // Lista de status que consideramos como "Aprovado"
    const approvedStatuses = ['paid', 'approved', 'succeeded', 'completed', 'pago', 'aprovado', 'paga'];

    if (approvedStatuses.includes(status)) {
      const purchaseData = {
        id: String(transactionId),
        status: status,
        email: body.email || body.customer?.email || 'N/A',
        timestamp: serverTimestamp(),
        accessed: false, // Inicialmente liberado para o primeiro acesso
        rawBody: rawText // Guardamos o log bruto para auditoria se necessário
      };

      // Grava em todos os IDs possíveis para garantir que qualquer um funcione na busca
      const idsToSave = [transactionId, notificationId, externalId].filter(id => id && typeof id === 'string' || typeof id === 'number');
      
      const savePromises = idsToSave.map(id => 
        setDoc(doc(db, 'purchases', String(id).trim()), purchaseData, { merge: true })
      );

      await Promise.all(savePromises);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    // Sempre retorna 200 para o gateway para evitar retentativas infinitas se for erro de lógica
    return NextResponse.json({ success: true, error: error.message }, { status: 200 });
  }
}
